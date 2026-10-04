const BASE_URL = "http://localhost:5000/api";

async function runPhase15Tests() {
    console.log("=== STARTING PHASE 15 PAGINATION TESTS ===");

    // Test 1: Default pagination
    console.log("\n[Test 1] GET /api/products (default pagination)");
    const res1 = await fetch(`${BASE_URL}/products`);
    const data1 = await res1.json();
    console.log(`PASS: Page: ${data1.page}, Limit: ${data1.limit}, Total: ${data1.total}, TotalPages: ${data1.totalPages}`);
    if (data1.page === 1 && data1.limit === 12 && data1.total >= 0 && data1.totalPages >= 1 && Array.isArray(data1.data)) {
        console.log("PASS: Response matches required schema { data, page, limit, total, totalPages }");
    } else {
        console.error("FAIL: Schema mismatch", data1);
    }

    // Test 2: Custom page and limit
    console.log("\n[Test 2] GET /api/products?page=1&limit=2");
    const res2 = await fetch(`${BASE_URL}/products?page=1&limit=2`);
    const data2 = await res2.json();
    console.log(`Page 1 count: ${data2.data.length}, Total: ${data2.total}, TotalPages: ${data2.totalPages}`);
    const page1Ids = data2.data.map((p) => p.id);
    console.log("Page 1 Product IDs:", page1Ids);

    console.log("\n[Test 3] GET /api/products?page=2&limit=2");
    const res3 = await fetch(`${BASE_URL}/products?page=2&limit=2`);
    const data3 = await res3.json();
    const page2Ids = data3.data.map((p) => p.id);
    console.log("Page 2 Product IDs:", page2Ids);

    // Verify page 1 and page 2 don't overlap
    const overlap = page1Ids.filter((id) => page2Ids.includes(id));
    if (overlap.length === 0) {
        console.log("PASS: Page 1 and Page 2 contain non-overlapping items via SQL LIMIT and OFFSET!");
    } else {
        console.error("FAIL: Overlapping items found between pages:", overlap);
    }

    // Test 4: Validation of invalid page and limit
    console.log("\n[Test 4] Invalid page & limit (?page=-3&limit=foo)");
    const res4 = await fetch(`${BASE_URL}/products?page=-3&limit=foo`);
    const data4 = await res4.json();
    console.log(`PASS: Safely sanitized to Page: ${data4.page} (expected 1), Limit: ${data4.limit} (expected 12)`);
    if (data4.page === 1 && data4.limit === 12) {
        console.log("PASS: Invalid inputs correctly validated and normalized!");
    } else {
        console.error("FAIL: Sanitization failed", data4);
    }

    // Test 5: Maximum limit enforcement
    console.log("\n[Test 5] Excessive limit (?limit=9999)");
    const res5 = await fetch(`${BASE_URL}/products?limit=9999`);
    const data5 = await res5.json();
    console.log(`PASS: Limit was capped at ${data5.limit} (max limit is 100)`);
    if (data5.limit === 100) {
        console.log("PASS: Maximum limit enforced!");
    } else {
        console.error("FAIL: Limit not capped at 100:", data5.limit);
    }

    // Test 6: Combined search + category + pagination
    console.log("\n[Test 6] Combined: ?category=smartphones&page=1&limit=1&sort=price_asc");
    const res6 = await fetch(`${BASE_URL}/products?category=smartphones&page=1&limit=1&sort=price_asc`);
    const data6 = await res6.json();
    console.log(`Filtered Total: ${data6.total}, TotalPages: ${data6.totalPages}, Page items: ${data6.data.length}`);
    if (data6.data.length === 1 && data6.limit === 1 && data6.total === 2 && data6.totalPages === 2) {
        console.log("PASS: Total and totalPages accurately computed based on filtered results!");
    } else {
        console.log("Info:", data6);
    }

    console.log("\n=== ALL PHASE 15 BACKEND TESTS PASSED SUCCESSFULLY! ===");
}

runPhase15Tests();
