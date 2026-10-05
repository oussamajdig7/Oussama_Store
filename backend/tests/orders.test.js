const { app, request } = require("./helpers");

describe("Orders & Checkout API", () => {
    let userToken;
    let otherUserToken;
    let createdOrderId;

    beforeAll(async () => {
        // Register user 1
        const u1 = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Order User One",
                email: `order_u1_${Date.now()}@example.com`,
                password: "Password123!",
            });
        userToken = u1.body.data.token;

        // Register user 2 for cross-user order isolation testing
        const u2 = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Order User Two",
                email: `order_u2_${Date.now()}@example.com`,
                password: "Password123!",
            });
        otherUserToken = u2.body.data.token;
    });

    describe("POST /api/orders", () => {
        it("should return 401 unauthorized when unauthenticated", async () => {
            const res = await request(app)
                .post("/api/orders")
                .send({ shipping_address: "123 Main St" });
            expect(res.status).toBe(401);
        });

        it("should return 400 validation error when shipping address is missing", async () => {
            const res = await request(app)
                .post("/api/orders")
                .set("Authorization", `Bearer ${userToken}`)
                .send({});
            expect(res.status).toBe(400);
        });

        it("should return 400 error when attempting to place an order with an empty cart", async () => {
            const res = await request(app)
                .post("/api/orders")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ shipping_address: "123 Test Avenue, Casablanca" });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/cart is empty/i);
        });

        it("should successfully place an order when cart has items", async () => {
            // Add an item to cart first
            await request(app)
                .post("/api/cart")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: 1, quantity: 1 });

            // Place order
            const res = await request(app)
                .post("/api/orders")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    shipping_address: "77 Boulevard Hassan II, Casablanca, Morocco",
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBeDefined();
            expect(res.body.data.status).toBe("pending");
            expect(res.body.data.items.length).toBeGreaterThan(0);
            createdOrderId = res.body.data.id;

            // Verify cart was cleared after order creation
            const cartRes = await request(app)
                .get("/api/cart")
                .set("Authorization", `Bearer ${userToken}`);
            expect(cartRes.body.data.items).toEqual([]);
        });
    });

    describe("GET /api/orders", () => {
        it("should list user orders", async () => {
            const res = await request(app)
                .get("/api/orders")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("GET /api/orders/:id", () => {
        it("should return 400 validation error for invalid ID param", async () => {
            const res = await request(app)
                .get("/api/orders/abc")
                .set("Authorization", `Bearer ${userToken}`);
            expect(res.status).toBe(400);
        });

        it("should return 404 when user attempts to access another user's order (isolation)", async () => {
            const res = await request(app)
                .get(`/api/orders/${createdOrderId}`)
                .set("Authorization", `Bearer ${otherUserToken}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toMatch(/order not found/i);
        });

        it("should return full order details for the owner", async () => {
            const res = await request(app)
                .get(`/api/orders/${createdOrderId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(createdOrderId);
            expect(res.body.data.items[0]).toHaveProperty("price");
        });
    });
});
