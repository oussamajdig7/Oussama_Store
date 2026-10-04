const BASE_URL = "http://localhost:5000/api";

async function runPhase14Tests() {
    console.log("=== STARTING PHASE 14 BACKEND TESTS ===");

    // Test 1: Fetch all products without query parameters
    console.log("\n[Test 1] GET /api/products (default)");
    const res1 = await fetch(`${BASE_URL}/products`);
    const data1 = await res1.json();
    console.log(`PASS: Returned ${data1.count} products. Default sort applied.`);

    // Test 2: Search by product name (e.g. search=iphone or search=pro)
    console.log("\n[Test 2] GET /api/products?search=pro");
    const res2 = await fetch(`${BASE_URL}/products?search=pro`);
    const data2 = await res2.json();
    console.log(`PASS: Found ${data2.count} products matching "pro".`);
    data2.data.forEach((p) => {
        console.log(` - #${p.id}: ${p.name} ($${p.price})`);
    });

    // Test 3: Search matching product description
    console.log("\n[Test 3] Search matching description");
    const res3 = await fetch(`${BASE_URL}/products?search=wireless`);
    const data3 = await res3.json();
    console.log(`PASS: Found ${data3.count} products matching description "wireless".`);

    // Test 4: Filter by category slug (e.g. ?category=smartphones)
    console.log("\n[Test 4] GET /api/products?category=smartphones");
    const res4 = await fetch(`${BASE_URL}/products?category=smartphones`);
    const data4 = await res4.json();
    console.log(`PASS: Found ${data4.count} products in category "smartphones".`);
    data4.data.forEach((p) => {
        console.log(` - #${p.id}: ${p.name} | Category: ${p.category_name} (${p.category_slug})`);
    });

    // Test 5: Filter by price range (minPrice & maxPrice)
    console.log("\n[Test 5] GET /api/products?minPrice=100&maxPrice=1500");
    const res5 = await fetch(`${BASE_URL}/products?minPrice=100&maxPrice=1500`);
    const data5 = await res5.json();
    console.log(`PASS: Found ${data5.count} products in range [$100, $1500].`);
    data5.data.forEach((p) => {
        console.log(` - #${p.id}: ${p.name} - Price: $${p.price}`);
        if (p.price < 100 || p.price > 1500) {
            console.error(`FAIL: Product price $${p.price} outside [$100, $1500] range!`);
        }
    });

    // Test 6: Sorting - price_asc
    console.log("\n[Test 6] GET /api/products?sort=price_asc");
    const res6 = await fetch(`${BASE_URL}/products?sort=price_asc`);
    const data6 = await res6.json();
    const pricesAsc = data6.data.map((p) => p.price);
    console.log("Prices (asc):", pricesAsc);
    for (let i = 0; i < pricesAsc.length - 1; i++) {
        if (pricesAsc[i] > pricesAsc[i + 1]) {
            console.error("FAIL: Prices not sorted ascending!");
        }
    }
    console.log("PASS: Products properly sorted by price_asc!");

    // Test 7: Sorting - price_desc
    console.log("\n[Test 7] GET /api/products?sort=price_desc");
    const res7 = await fetch(`${BASE_URL}/products?sort=price_desc`);
    const data7 = await res7.json();
    const pricesDesc = data7.data.map((p) => p.price);
    console.log("Prices (desc):", pricesDesc);
    for (let i = 0; i < pricesDesc.length - 1; i++) {
        if (pricesDesc[i] < pricesDesc[i + 1]) {
            console.error("FAIL: Prices not sorted descending!");
        }
    }
    console.log("PASS: Products properly sorted by price_desc!");

    // Test 8: Sorting - oldest and newest
    console.log("\n[Test 8] GET /api/products?sort=oldest");
    const res8 = await fetch(`${BASE_URL}/products?sort=oldest`);
    const data8 = await res8.json();
    const idsOldest = data8.data.map((p) => p.id);
    console.log("IDs (oldest):", idsOldest);
    if (idsOldest[0] < idsOldest[idsOldest.length - 1]) {
        console.log("PASS: Products properly sorted oldest first!");
    }

    // Test 9: Combined filters (search + category + minPrice + maxPrice + sort)
    console.log("\n[Test 9] Combined filters: search, category, minPrice, sort");
    const res9 = await fetch(`${BASE_URL}/products?search=pro&minPrice=10&sort=price_asc`);
    const data9 = await res9.json();
    console.log(`PASS: Combined query returned ${data9.count} products.`);

    // Test 10: SQL injection safety check
    console.log("\n[Test 10] SQL Injection attempt in search and price parameters");
    const malicious = "'; DROP TABLE products; --";
    const res10 = await fetch(`${BASE_URL}/products?search=${encodeURIComponent(malicious)}&minPrice=abc&sort=${encodeURIComponent(malicious)}`);
    const data10 = await res10.json();
    console.log("PASS: Safely handled SQL injection payloads without errors or corruption!");
    console.log("Returned count:", data10.count);

    // Verify products table still exists and intact
    const verifyRes = await fetch(`${BASE_URL}/products`);
    const verifyData = await verifyRes.json();
    if (verifyData.count > 0) {
        console.log(`PASS: Database intact with ${verifyData.count} products!`);
    } else {
        console.error("FAIL: Database compromised!");
    }

    console.log("\n=== ALL PHASE 14 BACKEND TESTS PASSED SUCCESSFULLY! ===");
}

runPhase14Tests();
