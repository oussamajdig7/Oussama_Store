const { app, request, getAdminToken, getUserToken } = require("./helpers");

describe("Admin Authorization & Management API", () => {
    let adminToken;
    let userToken;
    let targetUserId;

    beforeAll(async () => {
        adminToken = await getAdminToken();
        userToken = await getUserToken();

        // Create a regular user whose role we can test updating
        const tempUser = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Role Test Subject",
                email: `role_subject_${Date.now()}@example.com`,
                password: "Password123!",
            });
        targetUserId = tempUser.body.data.user.id;
    });

    describe("GET /api/admin/dashboard", () => {
        it("should return 401 unauthorized when unauthenticated", async () => {
            const res = await request(app).get("/api/admin/dashboard");
            expect(res.status).toBe(401);
        });

        it("should return 403 forbidden when called by a non-admin user", async () => {
            const res = await request(app)
                .get("/api/admin/dashboard")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/admin privileges required/i);
        });

        it("should return comprehensive dashboard metrics for admin", async () => {
            const res = await request(app)
                .get("/api/admin/dashboard")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("total_users");
            expect(res.body.data).toHaveProperty("total_products");
            expect(res.body.data).toHaveProperty("total_orders");
            expect(res.body.data).toHaveProperty("total_revenue");
        });
    });

    describe("GET /api/admin/users and PUT /api/admin/users/:id/role", () => {
        it("should return 403 forbidden when regular user requests users list", async () => {
            const res = await request(app)
                .get("/api/admin/users")
                .set("Authorization", `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });

        it("should return users list with order counts for admin", async () => {
            const res = await request(app)
                .get("/api/admin/users")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it("should return 400 validation error for invalid role value", async () => {
            const res = await request(app)
                .put(`/api/admin/users/${targetUserId}/role`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ role: "super_super_admin" });

            expect(res.status).toBe(400);
        });

        it("should successfully update user role when admin provides valid role", async () => {
            const res = await request(app)
                .put(`/api/admin/users/${targetUserId}/role`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ role: "admin" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe("admin");
        });
    });

    describe("GET /api/admin/orders and PUT /api/admin/orders/:id/status", () => {
        it("should return 403 forbidden for regular user", async () => {
            const res = await request(app)
                .get("/api/admin/orders")
                .set("Authorization", `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });

        it("should list all store orders for admin", async () => {
            const res = await request(app)
                .get("/api/admin/orders")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it("should return 400 validation error for invalid order status enum", async () => {
            const res = await request(app)
                .put("/api/admin/orders/1/status")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "flying_to_mars" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should successfully update order status", async () => {
            const res = await request(app)
                .put("/api/admin/orders/1/status")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "delivered" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe("delivered");
        });
    });
});
