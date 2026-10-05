const { app, request, getUserToken } = require("./helpers");

describe("Wishlist API", () => {
    let userToken;

    beforeAll(async () => {
        // Register a clean user for wishlist tests
        const regRes = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Wishlist Test User",
                email: `wishlist_user_${Date.now()}@example.com`,
                password: "Password123!",
            });
        userToken = regRes.body.data.token;
    });

    describe("GET /api/wishlist", () => {
        it("should return 401 unauthorized without token", async () => {
            const res = await request(app).get("/api/wishlist");
            expect(res.status).toBe(401);
        });

        it("should return empty wishlist for new user", async () => {
            const res = await request(app)
                .get("/api/wishlist")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });
    });

    describe("POST /api/wishlist", () => {
        it("should return 400 validation error for missing product_id", async () => {
            const res = await request(app)
                .post("/api/wishlist")
                .set("Authorization", `Bearer ${userToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 when product does not exist", async () => {
            const res = await request(app)
                .post("/api/wishlist")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: 999999 });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should successfully add product to wishlist", async () => {
            const res = await request(app)
                .post("/api/wishlist")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: 1 });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.product_id).toBe(1);
        });

        it("should return 409 duplicate error when adding the same product again", async () => {
            const res = await request(app)
                .post("/api/wishlist")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ product_id: 1 });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/already in your wishlist/i);
        });
    });

    describe("DELETE /api/wishlist/:productId", () => {
        it("should return 404 when product is not in user's wishlist", async () => {
            const res = await request(app)
                .delete("/api/wishlist/999999")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(404);
        });

        it("should successfully remove product from wishlist", async () => {
            const res = await request(app)
                .delete("/api/wishlist/1")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
