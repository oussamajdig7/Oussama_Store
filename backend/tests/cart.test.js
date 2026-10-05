const { app, request, getUserToken, getAdminToken } = require("./helpers");

describe("Cart API", () => {
    let userToken;
    let otherUserToken;
    let cartItemId;

    beforeAll(async () => {
        userToken = await getUserToken();
        // Register an isolated second user to test cart authorization boundaries
        const regRes = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Cart Test User 2",
                email: `cart_user_${Date.now()}@example.com`,
                password: "Password123!",
            });
        otherUserToken = regRes.body.data.token;
    });

    describe("GET /api/cart", () => {
        it("should return 401 unauthorized when request has no token", async () => {
            const res = await request(app).get("/api/cart");
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return cart data for authenticated user", async () => {
            const res = await request(app)
                .get("/api/cart")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("items");
            expect(res.body.data).toHaveProperty("total");
            expect(res.body.data).toHaveProperty("total_quantity");
        });
    });

    describe("POST /api/cart", () => {
        it("should return 400 validation error for negative or zero quantity", async () => {
            const res = await request(app)
                .post("/api/cart")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: 1, quantity: -2 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 validation error for non-integer product_id", async () => {
            const res = await request(app)
                .post("/api/cart")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: "invalid", quantity: 1 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 when adding non-existent product", async () => {
            const res = await request(app)
                .post("/api/cart")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: 999999, quantity: 1 });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 stock limitation error when quantity exceeds product stock", async () => {
            const res = await request(app)
                .post("/api/cart")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: 1, quantity: 99999 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/exceeds available stock|stock limit/i);
        });

        it("should successfully add product to cart with valid quantity", async () => {
            const res = await request(app)
                .post("/api/cart")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: 1, quantity: 1 });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.product_id).toBe(1);
            cartItemId = res.body.data.cart_item_id;
        });

        it("should increment quantity when adding the same product again", async () => {
            const res = await request(app)
                .post("/api/cart")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: 1, quantity: 1 });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.quantity).toBeGreaterThanOrEqual(2);
        });
    });

    describe("PUT /api/cart/:id", () => {
        it("should return 400 validation error for invalid quantity", async () => {
            const res = await request(app)
                .put(`/api/cart/${cartItemId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ quantity: -1 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 when updating cart item of another user (isolation)", async () => {
            const res = await request(app)
                .put(`/api/cart/${cartItemId}`)
                .set("Authorization", `Bearer ${otherUserToken}`)
                .send({ quantity: 2 });

            expect(res.status).toBe(404);
            expect(res.body.message).toMatch(/not found in your cart/i);
        });

        it("should return 400 stock limitation error when updated quantity exceeds stock", async () => {
            const res = await request(app)
                .put(`/api/cart/${cartItemId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ quantity: 9999 });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/exceeds available stock/i);
        });

        it("should successfully update item quantity within stock limits", async () => {
            const res = await request(app)
                .put(`/api/cart/${cartItemId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ quantity: 3 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.quantity).toBe(3);
        });
    });

    describe("DELETE /api/cart/:id and DELETE /api/cart", () => {
        it("should return 404 when deleting cart item belonging to another user", async () => {
            const res = await request(app)
                .delete(`/api/cart/${cartItemId}`)
                .set("Authorization", `Bearer ${otherUserToken}`);

            expect(res.status).toBe(404);
        });

        it("should successfully remove single item from cart", async () => {
            const res = await request(app)
                .delete(`/api/cart/${cartItemId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should successfully clear entire cart", async () => {
            const res = await request(app)
                .delete("/api/cart")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.items).toEqual([]);
        });
    });
});
