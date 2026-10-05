const { app, request, getAdminToken, getUserToken } = require("./helpers");

describe("Products API", () => {
    let adminToken;
    let userToken;
    let createdProductId;
    const testSlug = `test-prod-${Date.now()}`;

    beforeAll(async () => {
        adminToken = await getAdminToken();
        userToken = await getUserToken();
    });

    describe("GET /api/products", () => {
        it("should return paginated list of products by default", async () => {
            const res = await request(app).get("/api/products");
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(12);
        });

        it("should filter products by search term", async () => {
            const res = await request(app).get("/api/products?search=pro");
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should filter products by price range", async () => {
            const res = await request(app).get("/api/products?minPrice=50&maxPrice=1500");
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            res.body.data.forEach((p) => {
                expect(p.price).toBeGreaterThanOrEqual(50);
                expect(p.price).toBeLessThanOrEqual(1500);
            });
        });

        it("should sort products by price ascending", async () => {
            const res = await request(app).get("/api/products?sort=price_asc");
            expect(res.status).toBe(200);
            const prices = res.body.data.map((p) => p.price);
            for (let i = 0; i < prices.length - 1; i++) {
                expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
            }
        });

        it("should gracefully sanitize negative and excessive query parameters", async () => {
            const res = await request(app).get("/api/products?page=-5&limit=9999");
            expect(res.status).toBe(200);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(100);
        });
    });

    describe("GET /api/products/:id", () => {
        it("should return 400 validation error for negative or invalid ID", async () => {
            const res = await request(app).get("/api/products/-1");
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 for non-existent product ID", async () => {
            const res = await request(app).get("/api/products/999999");
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should return product details for valid ID", async () => {
            const res = await request(app).get("/api/products/1");
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(1);
        });
    });

    describe("POST /api/products (Admin Protected)", () => {
        it("should return 401 unauthorized when unauthenticated", async () => {
            const res = await request(app)
                .post("/api/products")
                .send({ name: "Unauth Product" });
            expect(res.status).toBe(401);
        });

        it("should return 403 forbidden when regular user attempts to create product", async () => {
            const res = await request(app)
                .post("/api/products")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    name: "Forbidden Product",
                    slug: "forbidden-product",
                    category_id: 1,
                    price: 99.99,
                });
            expect(res.status).toBe(403);
        });

        it("should return 400 validation error when price is negative or invalid", async () => {
            const res = await request(app)
                .post("/api/products")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Invalid Price Product",
                    slug: "invalid-price-prod",
                    category_id: 1,
                    price: -10,
                });
            expect(res.status).toBe(400);
        });

        it("should return 400 validation error when category_id does not exist", async () => {
            const res = await request(app)
                .post("/api/products")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Bad Cat Product",
                    slug: "bad-cat-prod",
                    category_id: 99999,
                    price: 29.99,
                });
            expect(res.status).toBe(400);
        });

        it("should successfully create product with admin token", async () => {
            const res = await request(app)
                .post("/api/products")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Jest Test Smartphone",
                    slug: testSlug,
                    category_id: 1,
                    price: 499.99,
                    stock: 25,
                    description: "High quality smartphone tested via Jest",
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.slug).toBe(testSlug);
            createdProductId = res.body.data.id;
        });

        it("should return 409 conflict when product slug already exists", async () => {
            const res = await request(app)
                .post("/api/products")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Duplicate Smartphone",
                    slug: testSlug,
                    category_id: 1,
                    price: 499.99,
                    stock: 10,
                });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    describe("PUT /api/products/:id", () => {
        it("should return 403 forbidden for regular user update", async () => {
            const res = await request(app)
                .put(`/api/products/${createdProductId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ price: 399.99 });
            expect(res.status).toBe(403);
        });

        it("should return 404 for updating non-existent product", async () => {
            const res = await request(app)
                .put("/api/products/999999")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Does Not Exist", price: 10 });
            expect(res.status).toBe(404);
        });

        it("should successfully update product with admin token", async () => {
            const res = await request(app)
                .put(`/api/products/${createdProductId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Jest Test Smartphone Ultra",
                    price: 549.99,
                    stock: 30,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe("Jest Test Smartphone Ultra");
            expect(res.body.data.price).toBe(549.99);
        });
    });

    describe("DELETE /api/products/:id", () => {
        it("should return 403 forbidden for regular user deletion", async () => {
            const res = await request(app)
                .delete(`/api/products/${createdProductId}`)
                .set("Authorization", `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });

        it("should successfully delete product with admin token", async () => {
            const res = await request(app)
                .delete(`/api/products/${createdProductId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should return 404 after product has been deleted", async () => {
            const res = await request(app)
                .delete(`/api/products/${createdProductId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });
    });
});
