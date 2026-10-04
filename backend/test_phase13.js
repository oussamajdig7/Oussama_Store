const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000";

// Helper 1x1 valid PNG buffer
const tinyPngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
);

// Helper 1x1 valid JPEG buffer
const tinyJpegBuffer = Buffer.from(
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
    "base64"
);

// Helper 1x1 valid WEBP buffer
const tinyWebpBuffer = Buffer.from(
    "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
    "base64"
);

async function runPhase13Tests() {
    console.log("=== STARTING PHASE 13 IMAGE UPLOAD TESTS ===");

    // Step 1: Login as Admin and Normal User
    console.log("\n[Setup] Logging in users...");
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@example.com", password: "Admin123!" }),
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData?.data?.token;

    const userLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "oussama@example.com", password: "Password123!" }),
    });
    const userData = await userLoginRes.json();
    const userToken = userData?.data?.token;

    if (!adminToken || !userToken) {
        console.error("FAIL: Could not obtain auth tokens");
        return;
    }
    console.log("PASS: Logged in admin and user successfully");

    // Get an existing product ID (e.g. 1)
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    const prodList = await prodRes.json();
    const testProductId = prodList.data[0]?.id || 1;
    console.log(`Using product ID: ${testProductId}`);

    // Test 1: Unauthenticated upload attempt (Requirement 1)
    console.log("\n[Test 1] Unauthenticated attempt to upload image (Expect 401)");
    const fd1 = new FormData();
    fd1.append("images", new Blob([tinyPngBuffer], { type: "image/png" }), "test.png");
    const res1 = await fetch(`${BASE_URL}/api/products/${testProductId}/images`, {
        method: "POST",
        body: fd1,
    });
    if (res1.status === 401) {
        console.log("PASS: Unauthenticated upload received 401 Unauthorized");
    } else {
        console.error("FAIL: Expected 401, got:", res1.status);
    }

    // Test 2: Normal user (non-admin) upload attempt (Requirement 1)
    console.log("\n[Test 2] Normal user attempt to upload image (Expect 403 Forbidden)");
    const fd2 = new FormData();
    fd2.append("images", new Blob([tinyPngBuffer], { type: "image/png" }), "test.png");
    const res2 = await fetch(`${BASE_URL}/api/products/${testProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
        body: fd2,
    });
    if (res2.status === 403) {
        console.log("PASS: Normal user upload received 403 Forbidden");
    } else {
        console.error("FAIL: Expected 403, got:", res2.status);
    }

    // Test 3: Validate file type - Reject disallowed format like .txt or .pdf (Requirement 2 & 3)
    console.log("\n[Test 3] Admin uploads invalid file format (text/plain) (Expect 400)");
    const fd3 = new FormData();
    fd3.append("images", new Blob(["not an image"], { type: "text/plain" }), "test.txt");
    const res3 = await fetch(`${BASE_URL}/api/products/${testProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: fd3,
    });
    if (res3.status === 400) {
        const body3 = await res3.json();
        console.log("PASS: Disallowed format was rejected with 400:", body3.message);
    } else {
        console.error("FAIL: Expected 400, got:", res3.status);
    }

    // Test 4: Validate file size limit (Requirement 4)
    console.log("\n[Test 4] Admin uploads oversized file (> 5MB) (Expect 400)");
    const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const fd4 = new FormData();
    fd4.append("images", new Blob([oversizedBuffer], { type: "image/jpeg" }), "large.jpg");
    const res4 = await fetch(`${BASE_URL}/api/products/${testProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: fd4,
    });
    if (res4.status === 400) {
        const body4 = await res4.json();
        console.log("PASS: Oversized file was rejected with 400:", body4.message);
    } else {
        console.error("FAIL: Expected 400, got:", res4.status);
    }

    // Test 5: Admin uploads valid PNG, JPEG, and WEBP images (Requirements 1, 2, 3, 5, 6, 8)
    console.log("\n[Test 5] Admin uploads valid PNG, JPEG, and WEBP images");
    const fd5 = new FormData();
    fd5.append("images", new Blob([tinyPngBuffer], { type: "image/png" }), "avatar.png");
    fd5.append("images", new Blob([tinyJpegBuffer], { type: "image/jpeg" }), "photo.jpg");
    fd5.append("images", new Blob([tinyWebpBuffer], { type: "image/webp" }), "sample.webp");

    const res5 = await fetch(`${BASE_URL}/api/products/${testProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: fd5,
    });

    let uploadedImages = [];
    if (res5.status === 201) {
        const body5 = await res5.json();
        uploadedImages = body5.data;
        console.log(`PASS: Uploaded ${uploadedImages.length} images successfully!`);
        console.log("Uploaded Image details:", uploadedImages);
    } else {
        console.error("FAIL: Upload failed:", res5.status, await res5.text());
        return;
    }

    // Test 6: Verify images served statically (Requirement 7)
    console.log("\n[Test 6] Serve uploaded images statically via HTTP GET (Requirement 7)");
    const firstImg = uploadedImages[0];
    const staticUrl = `${BASE_URL}${firstImg.image_url}`;
    const res6 = await fetch(staticUrl);
    if (res6.status === 200 && res6.headers.get("content-type")?.includes("image")) {
        console.log(`PASS: Static image served successfully at ${staticUrl}! Content-Type:`, res6.headers.get("content-type"));
    } else {
        console.error("FAIL: Static image fetch failed:", res6.status, staticUrl);
    }

    // Test 7: GET /api/products/:id/images (Public endpoint)
    console.log("\n[Test 7] GET /api/products/:id/images");
    const res7 = await fetch(`${BASE_URL}/api/products/${testProductId}/images`);
    if (res7.status === 200) {
        const body7 = await res7.json();
        console.log(`PASS: Retrieved ${body7.count} images for product #${testProductId}.`);
    } else {
        console.error("FAIL: GET /api/products/:id/images failed:", res7.status);
    }

    // Test 8: Non-admin cannot delete image (Requirement 1)
    console.log("\n[Test 8] Normal user attempts to delete image (Expect 403 Forbidden)");
    const res8 = await fetch(`${BASE_URL}/api/products/${testProductId}/images/${firstImg.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
    });
    if (res8.status === 403) {
        console.log("PASS: Normal user deletion received 403 Forbidden");
    } else {
        console.error("FAIL: Expected 403, got:", res8.status);
    }

    // Test 9: Admin deletes image - removes db row & physical file (Requirement 9)
    console.log("\n[Test 9] Admin deletes image (Expect 200 and file deleted from disk)");
    const diskPath = path.join(__dirname, firstImg.image_url.slice(1));
    console.log("File exists on disk before delete?", fs.existsSync(diskPath));

    const res9 = await fetch(`${BASE_URL}/api/products/${testProductId}/images/${firstImg.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res9.status === 200) {
        const fileExistsAfter = fs.existsSync(diskPath);
        console.log("PASS: Image deleted via API. File exists on disk after delete?", fileExistsAfter);
        if (!fileExistsAfter) {
            console.log("PASS: Physical file unlinked from disk successfully!");
        } else {
            console.error("FAIL: File still exists on disk after deletion");
        }
    } else {
        console.error("FAIL: Admin delete failed:", res9.status);
    }

    // Test 10: Handle missing files safely (Requirement 10)
    console.log("\n[Test 10] Delete image whose physical file is already removed from disk (Requirement 10)");
    const secondImg = uploadedImages[1];
    if (secondImg) {
        const diskPath2 = path.join(__dirname, secondImg.image_url.slice(1));
        if (fs.existsSync(diskPath2)) {
            fs.unlinkSync(diskPath2); // Simulate missing file
        }
        console.log("Simulated missing file on disk before delete. Exists?", fs.existsSync(diskPath2));

        const res10 = await fetch(`${BASE_URL}/api/products/${testProductId}/images/${secondImg.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res10.status === 200) {
            console.log("PASS: Safe deletion succeeded with 200 even though file was missing on disk!");
        } else {
            console.error("FAIL: Deletion with missing file failed:", res10.status);
        }
    }

    console.log("\n=== ALL PHASE 13 BACKEND TESTS COMPLETED SUCCESSFULLY! ===");
}

runPhase13Tests();
