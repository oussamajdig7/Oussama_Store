const { app, request, getAdminToken, getUserToken } = require("./helpers");

describe("Categories API", () => {
    let adminToken;
    let userToken;
    let createdCategoryId;
    const testSlug = `test-cat-${Date.now()}`;

    beforeAll(async () => {
        adminToken = await getAdminToken();
        userToken = await getUserToken();
    });

    describe("GET /api/categories", () => {
        it("should return list of categories successfully", async () => {
            const res = await request(app).get("/api/categories");
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe("GET /api/categories/:id", () => {
        it("should return 400 validation error for non-numeric ID", async () => {
            const res = await request(app).get("/api/categories/not-a-number");
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 for non-existent category ID", async () => {
            const res = await request(app).get("/api/categories/999999");
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should return category details for existing ID", async () => {
            const res = await request(app).get("/api/categories/1");
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(1);
        });
    });

    describe("POST /api/categories (Admin Protected)", () => {
        it("should return 401 unauthorized when no token provided", async () => {
            const res = await request(app)
                .post("/api/categories")
                .send({ name: "Unauthorized Cat", slug: "unauth-cat" });
            expect(res.status).toBe(401);
        });

        it("should return 403 forbidden when regular user attempts to create category", async () => {
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ name: "Forbidden Cat", slug: "forbidden-cat" });
            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/admin privileges required/i);
        });

        it("should return 400 validation error when name is missing", async () => {
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ slug: "no-name-cat" });
            expect(res.status).toBe(400);
        });

        it("should successfully create category when admin provides valid data", async () => {
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Test Hardware", slug: testSlug });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.slug).toBe(testSlug);
            createdCategoryId = res.body.data.id;
        });

        it("should return 409 conflict when slug already exists", async () => {
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Duplicate Category", slug: testSlug });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    describe("PUT /api/categories/:id", () => {
        it("should return 404 when updating non-existent category", async () => {
            const res = await request(app)
                .put("/api/categories/999999")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Non-existent", slug: "non-existent" });
            expect(res.status).toBe(404);
        });

        it("should successfully update category with admin privileges", async () => {
            const res = await request(app)
                .put(`/api/categories/${createdCategoryId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Test Hardware Pro", slug: `updated-${testSlug}` });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe("Test Hardware Pro");
        });
    });

    describe("DELETE /api/categories/:id", () => {
        it("should return 403 forbidden when regular user attempts to delete category", async () => {
            const res = await request(app)
                .delete(`/api/categories/${createdCategoryId}`)
                .set("Authorization", `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });

        it("should successfully delete category with admin privileges", async () => {
            const res = await request(app)
                .delete(`/api/categories/${createdCategoryId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("should return 404 after category was already deleted", async () => {
            const res = await request(app)
                .delete(`/api/categories/${createdCategoryId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });
    });
});
