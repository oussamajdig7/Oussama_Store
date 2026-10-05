const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const BASE_URL = "http://localhost:5000/api";
const ROOT_URL = "http://localhost:5000";

let testPassed = 0;
let testFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  PASS: ${message}`);
        testPassed++;
    } else {
        console.error(`  FAIL: ${message}`);
        testFailed++;
    }
}

async function request(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
            ...options.headers,
        },
        method: options.method || "GET",
        ...(options.body ? { body: typeof options.body === "string" ? options.body : JSON.stringify(options.body) } : {}),
    });
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
    return { status: res.status, headers: res.headers, ok: res.ok, data };
}

async function runSecurityAudit() {
    console.log("=== PHASE 17 SECURITY HARDENING VERIFICATION SUITE ===\n");

    // ---------------------------------------------------------
    // 1. Helmet Security Headers
    // ---------------------------------------------------------
    console.log("[Test 1] Helmet Security Headers");
    const resRoot = await request(ROOT_URL);
    const nosniff = resRoot.headers.get("x-content-type-options");
    const frameOptions = resRoot.headers.get("x-frame-options");
    const corp = resRoot.headers.get("cross-origin-resource-policy");
    const poweredBy = resRoot.headers.get("x-powered-by");

    assert(nosniff === "nosniff", "x-content-type-options is 'nosniff'");
    assert(frameOptions === "SAMEORIGIN" || frameOptions === "DENY", "x-frame-options header is set");
    assert(corp === "cross-origin", "cross-origin-resource-policy is 'cross-origin' for static assets");
    assert(!poweredBy, "x-powered-by header is hidden (mitigates fingerprinting)");

    // ---------------------------------------------------------
    // 2. CORS Configuration
    // ---------------------------------------------------------
    console.log("\n[Test 2] CORS Whitelist and Blocking");
    // Whitelisted origin
    const corsGood = await request(`${BASE_URL}/products`, {
        headers: { Origin: "http://localhost:5173" },
    });
    assert(corsGood.status === 200, "Whitelisted origin http://localhost:5173 receives 200 OK");
    assert(
        corsGood.headers.get("access-control-allow-origin") === "http://localhost:5173",
        "Access-Control-Allow-Origin correctly set to client origin"
    );

    // Blocked malicious origin
    const corsBad = await request(`${BASE_URL}/products`, {
        headers: { Origin: "http://evil-attacker.com" },
    });
    assert(
        corsBad.status === 403 || corsBad.status === 500,
        `Untrusted origin http://evil-attacker.com was blocked (HTTP ${corsBad.status})`
    );

    // ---------------------------------------------------------
    // 3. User Authentication & Password Masking
    // ---------------------------------------------------------
    console.log("\n[Test 3] Password and Credential Protection");
    const loginRes = await request(`${BASE_URL}/auth/login`, {
        method: "POST",
        body: { email: "oussama@example.com", password: "Password123!" },
    });
    assert(loginRes.status === 200, "Login successful with valid credentials");
    const userPayload = loginRes.data?.data?.user;
    assert(userPayload && !userPayload.password, "Password is NEVER exposed in login response payload");

    const token = loginRes.data?.data?.token;
    assert(typeof token === "string" && token.length > 20, "JWT token returned cleanly");

    // Profile endpoint
    const meRes = await request(`${BASE_URL}/auth/me`, { token });
    assert(meRes.status === 200, "GET /api/auth/me returns 200");
    assert(meRes.data?.data && !meRes.data.data.password, "Password is NEVER exposed in /auth/me payload");

    // ---------------------------------------------------------
    // 4. Request Body Validation via Zod
    // ---------------------------------------------------------
    console.log("\n[Test 4] Request Body Validation (Zod)");
    // Registration with short password (< 8 chars)
    const shortPwdRes = await request(`${BASE_URL}/auth/register`, {
        method: "POST",
        body: { name: "Test", email: "test_short@example.com", password: "123" },
    });
    assert(shortPwdRes.status === 400, "Password < 8 characters rejected with 400 Bad Request");
    assert(
        JSON.stringify(shortPwdRes.data).includes("8 characters"),
        "Validation error message explains password length requirement"
    );

    // Registration with invalid email format
    const badEmailRes = await request(`${BASE_URL}/auth/register`, {
        method: "POST",
        body: { name: "Test", email: "not-an-email", password: "Password123!" },
    });
    assert(badEmailRes.status === 400, "Invalid email format rejected with 400 Bad Request");

    // ---------------------------------------------------------
    // 5. URL Route Params Validation
    // ---------------------------------------------------------
    console.log("\n[Test 5] URL Parameter Validation (Zod coercion & positive integers)");
    // Non-numeric ID
    const nonNumericRes = await request(`${BASE_URL}/products/abc`);
    assert(nonNumericRes.status === 400, "Non-numeric product ID /products/abc rejected with 400 Bad Request");

    // Negative ID
    const negativeIdRes = await request(`${BASE_URL}/products/-5`);
    assert(negativeIdRes.status === 400, "Negative product ID /products/-5 rejected with 400 Bad Request");

    // Float ID
    const floatIdRes = await request(`${BASE_URL}/products/1.5`);
    assert(floatIdRes.status === 400, "Float product ID /products/1.5 rejected with 400 Bad Request");

    // ---------------------------------------------------------
    // 6. Query Parameter Sanitization & Pagination
    // ---------------------------------------------------------
    console.log("\n[Test 6] Query Parameter Sanitization (Pagination & Limits)");
    const querySanitizeRes = await request(`${BASE_URL}/products?page=-99&limit=99999`);
    assert(querySanitizeRes.status === 200, "Negative page and excessive limit sanitized gracefully");
    assert(querySanitizeRes.data.page === 1, "Page sanitized to default 1");
    assert(querySanitizeRes.data.limit === 100, "Limit capped to safe maximum of 100");

    // ---------------------------------------------------------
    // 7. Cart & Business Logic Protection (No Negative Quantities)
    // ---------------------------------------------------------
    console.log("\n[Test 7] Quantity Validation & Stock Protection");
    // Negative quantity in add-to-cart
    const negQtyRes = await request(`${BASE_URL}/cart`, {
        method: "POST",
        token,
        body: { product_id: 1, quantity: -5 },
    });
    assert(negQtyRes.status === 400, "Negative cart quantity rejected with 400 Bad Request");

    // Zero quantity in add-to-cart
    const zeroQtyRes = await request(`${BASE_URL}/cart`, {
        method: "POST",
        token,
        body: { product_id: 1, quantity: 0 },
    });
    assert(zeroQtyRes.status === 400, "Zero cart quantity rejected with 400 Bad Request");

    // String quantity
    const strQtyRes = await request(`${BASE_URL}/cart`, {
        method: "POST",
        token,
        body: { product_id: 1, quantity: "three" },
    });
    assert(strQtyRes.status === 400, "Non-numeric quantity rejected with 400 Bad Request");

    // ---------------------------------------------------------
    // 8. Cross-User Cart & Order Isolation
    // ---------------------------------------------------------
    console.log("\n[Test 8] Cross-User Isolation (Cart & Orders)");
    // Create a temporary secondary user
    const user2Email = `user2_${Date.now()}@example.com`;
    const reg2 = await request(`${BASE_URL}/auth/register`, {
        method: "POST",
        body: { name: "User Two", email: user2Email, password: "Password123!" },
    });
    const token2 = reg2.data?.data?.token;

    // User 2 adds item to their cart
    await request(`${BASE_URL}/cart`, {
        method: "POST",
        token: token2,
        body: { product_id: 1, quantity: 1 },
    });
    const cartUser2 = await request(`${BASE_URL}/cart`, { token: token2 });
    const user2CartItemId = cartUser2.data?.data?.items[0]?.id;

    // User 1 attempts to update or delete User 2's cart item
    const hijackAttempt = await request(`${BASE_URL}/cart/${user2CartItemId}`, {
        method: "PUT",
        token, // User 1 token
        body: { quantity: 2 },
    });
    assert(
        hijackAttempt.status === 404,
        "User 1 cannot modify User 2's cart item (Returns 404 Not Found)"
    );

    const deleteAttempt = await request(`${BASE_URL}/cart/${user2CartItemId}`, {
        method: "DELETE",
        token, // User 1 token
    });
    assert(
        deleteAttempt.status === 404,
        "User 1 cannot delete User 2's cart item (Returns 404 Not Found)"
    );

    // ---------------------------------------------------------
    // 9. Admin Authorization Enforcement
    // ---------------------------------------------------------
    console.log("\n[Test 9] Admin Route Authorization");
    // User 2 (normal user) attempts to access admin dashboard
    const adminDashAttempt = await request(`${BASE_URL}/admin/dashboard`, { token: token2 });
    assert(adminDashAttempt.status === 403, "Normal user received 403 Forbidden on /api/admin/dashboard");

    // User 2 attempts to change their own role to admin
    const roleEscalateAttempt = await request(`${BASE_URL}/admin/users/${reg2.data.data.user.id}/role`, {
        method: "PUT",
        token: token2,
        body: { role: "admin" },
    });
    assert(roleEscalateAttempt.status === 403, "Privilege escalation attempt blocked with 403 Forbidden");

    // ---------------------------------------------------------
    // 10. Malformed JSON Body Protection
    // ---------------------------------------------------------
    console.log("\n[Test 10] Malformed JSON Body Handling");
    const badJsonRes = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ this is not valid json }",
    });
    assert(badJsonRes.status === 400, "Malformed JSON rejected with 400 Bad Request");
    const badJsonData = await badJsonRes.json();
    assert(
        badJsonData.message.includes("Malformed JSON") || badJsonData.message.includes("JSON"),
        "Error message clearly identifies malformed JSON"
    );

    // ---------------------------------------------------------
    // Summary
    // ---------------------------------------------------------
    console.log("\n=========================================");
    console.log(`AUDIT RESULTS: ${testPassed} Passed, ${testFailed} Failed`);
    console.log("=========================================\n");

    if (testFailed > 0) {
        process.exit(1);
    }
}

runSecurityAudit().catch((err) => {
    console.error("FATAL in test suite:", err);
    process.exit(1);
});
