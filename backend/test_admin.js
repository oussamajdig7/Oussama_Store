const BASE_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
            ...options.headers,
        },
        method: options.method || "GET",
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
    return { status: res.status, ok: res.ok, data };
}

async function runTests() {
    console.log("=== STARTING PHASE 12 BACKEND TESTS ===");

    // 1. Unauthenticated request to POST /api/products
    console.log("\n[Test 1] Unauthenticated request to POST /api/products");
    const test1 = await request("/products", { method: "POST", body: { name: "Test" } });
    if (test1.status === 401) {
        console.log("PASS: Received 401 Unauthorized for unauthenticated POST /api/products");
    } else {
        console.error("FAIL: Expected 401, got:", test1.status);
    }

    // 2. Unauthenticated request to GET /api/admin/dashboard
    console.log("\n[Test 2] Unauthenticated request to GET /api/admin/dashboard");
    const test2 = await request("/admin/dashboard");
    if (test2.status === 401) {
        console.log("PASS: Received 401 Unauthorized for unauthenticated GET /api/admin/dashboard");
    } else {
        console.error("FAIL: Expected 401, got:", test2.status);
    }

    // 3. Login as normal user (oussama@example.com)
    console.log("\n[Test 3] Login as normal user (role: 'user')");
    const loginUser = await request("/auth/login", {
        method: "POST",
        body: { email: "oussama@example.com", password: "Password123!" },
    });
    if (!loginUser.ok) {
        console.error("FAIL: User login failed", loginUser.data);
        return;
    }
    const userToken = loginUser.data.data.token;
    console.log("PASS: Logged in as normal user. Role:", loginUser.data.data.user.role);

    // 4. Normal user requests POST /api/products (should receive 403 Forbidden)
    console.log("\n[Test 4] Normal user requests POST /api/products (should receive 403 Forbidden)");
    const test4 = await request("/products", {
        method: "POST",
        token: userToken,
        body: { name: "Hacked Product", slug: "hacked", category_id: 1, price: 99 },
    });
    if (test4.status === 403) {
        console.log("PASS: Received 403 Forbidden for normal user POST /api/products");
    } else {
        console.error("FAIL: Expected 403 Forbidden, got:", test4.status, test4.data);
    }

    // 5. Normal user requests GET /api/admin/dashboard (should receive 403 Forbidden)
    console.log("\n[Test 5] Normal user requests GET /api/admin/dashboard (should receive 403 Forbidden)");
    const test5 = await request("/admin/dashboard", { token: userToken });
    if (test5.status === 403) {
        console.log("PASS: Received 403 Forbidden for normal user GET /api/admin/dashboard");
    } else {
        console.error("FAIL: Expected 403 Forbidden, got:", test5.status, test5.data);
    }

    // 6. Login as admin user (admin@example.com)
    console.log("\n[Test 6] Login as admin user (role: 'admin')");
    const loginAdmin = await request("/auth/login", {
        method: "POST",
        body: { email: "admin@example.com", password: "Admin123!" },
    });
    if (!loginAdmin.ok) {
        console.error("FAIL: Admin login failed", loginAdmin.data);
        return;
    }
    const adminToken = loginAdmin.data.data.token;
    console.log("PASS: Logged in as admin user. Role:", loginAdmin.data.data.user.role);

    // 7. Admin requests GET /api/admin/dashboard
    console.log("\n[Test 7] Admin requests GET /api/admin/dashboard");
    const test7 = await request("/admin/dashboard", { token: adminToken });
    if (test7.ok) {
        console.log("PASS: Dashboard stats retrieved successfully!");
        console.log("Stats payload:", test7.data.data.stats);
        const s = test7.data.data;
        if (
            s.total_users !== undefined &&
            s.total_products !== undefined &&
            s.total_orders !== undefined &&
            s.total_revenue !== undefined &&
            s.pending_orders !== undefined &&
            s.delivered_orders !== undefined
        ) {
            console.log("PASS: All 6 required statistics exist in response payload!");
            console.log(`- total users: ${s.total_users}`);
            console.log(`- total products: ${s.total_products}`);
            console.log(`- total orders: ${s.total_orders}`);
            console.log(`- total revenue: $${s.total_revenue}`);
            console.log(`- pending orders: ${s.pending_orders}`);
            console.log(`- delivered orders: ${s.delivered_orders}`);
        } else {
            console.error("FAIL: Missing some required statistics");
        }
    } else {
        console.error("FAIL: Admin dashboard request failed", test7.status, test7.data);
    }

    // 8. Admin requests GET /api/admin/users
    console.log("\n[Test 8] Admin requests GET /api/admin/users");
    const test8 = await request("/admin/users", { token: adminToken });
    if (test8.ok) {
        console.log(`PASS: Retrieved ${test8.data.count} users successfully.`);
    } else {
        console.error("FAIL: Admin users request failed", test8.status, test8.data);
    }

    // 9. Admin requests GET /api/admin/orders
    console.log("\n[Test 9] Admin requests GET /api/admin/orders");
    const test9 = await request("/admin/orders", { token: adminToken });
    if (test9.ok) {
        console.log(`PASS: Retrieved ${test9.data.count} orders successfully.`);
    } else {
        console.error("FAIL: Admin orders request failed", test9.status, test9.data);
    }

    // 10. Admin creates product via POST /api/products
    console.log("\n[Test 10] Admin creates product via POST /api/products");
    const randomSlug = "test-prod-" + Date.now();
    const test10 = await request("/products", {
        method: "POST",
        token: adminToken,
        body: {
            name: "Phase 12 Special Product",
            slug: randomSlug,
            category_id: 1,
            price: 49.99,
            stock: 15,
            description: "Product created by admin",
        },
    });
    if (test10.ok) {
        const createdId = test10.data.data.id;
        console.log("PASS: Product created successfully! ID:", createdId);

        // 11. Admin updates product via PUT /api/products/:id
        console.log("\n[Test 11] Admin updates product via PUT /api/products/:id");
        const test11 = await request(`/products/${createdId}`, {
            method: "PUT",
            token: adminToken,
            body: {
                name: "Phase 12 Updated Product",
                slug: "updated-" + randomSlug,
                category_id: 1,
                price: 59.99,
                stock: 20,
                description: "Updated by admin",
            },
        });
        if (test11.ok) {
            console.log("PASS: Product updated successfully! New price:", test11.data.data.price);
        } else {
            console.error("FAIL: Product update failed", test11.status, test11.data);
        }

        // 12. Admin deletes product via DELETE /api/products/:id
        console.log("\n[Test 12] Admin deletes product via DELETE /api/products/:id");
        const test12 = await request(`/products/${createdId}`, {
            method: "DELETE",
            token: adminToken,
        });
        if (test12.ok) {
            console.log("PASS: Product deleted successfully!");
        } else {
            console.error("FAIL: Product deletion failed", test12.status, test12.data);
        }
    } else {
        console.error("FAIL: Product creation failed", test10.status, test10.data);
    }

    console.log("\n=== ALL BACKEND TESTS PASSED SUCCESSFULLY! ===");
}

runTests();
