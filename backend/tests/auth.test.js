const { app, request, getUserToken } = require("./helpers");

describe("Authentication & Authorization API", () => {
    describe("POST /api/auth/register", () => {
        const uniqueEmail = `test_auth_${Date.now()}@example.com`;

        it("should successfully register a new user", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Jest Test User",
                    email: uniqueEmail,
                    password: "Password123!",
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toBeDefined();
            expect(res.body.data.user.email).toBe(uniqueEmail);
            expect(res.body.data.user.password).toBeUndefined();
            expect(res.body.data.token).toBeDefined();
        });

        it("should fail validation if password is shorter than 8 characters", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Short Pwd",
                    email: "short@example.com",
                    password: "short",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/8 characters/i);
        });

        it("should fail validation if email format is invalid", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Bad Email",
                    email: "invalid-email-string",
                    password: "Password123!",
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 409 conflict when registering a duplicate email", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Duplicate User",
                    email: uniqueEmail,
                    password: "Password123!",
                });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    describe("POST /api/auth/login", () => {
        it("should successfully authenticate with valid credentials", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "oussama@example.com",
                    password: "Password123!",
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe("oussama@example.com");
            expect(res.body.data.user.password).toBeUndefined();
            expect(res.body.data.token).toBeDefined();
        });

        it("should reject invalid password with 401 unauthorized", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "oussama@example.com",
                    password: "WrongPassword999!",
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should reject non-existent user with 401 unauthorized", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "ghost_user_nonexistent@example.com",
                    password: "Password123!",
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should fail validation on missing fields", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "oussama@example.com" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("GET /api/auth/me", () => {
        it("should return 401 unauthorized if no token is provided", async () => {
            const res = await request(app).get("/api/auth/me");
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 unauthorized if token is malformed", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer invalid.jwt.token");
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return authenticated user profile without password", async () => {
            const token = await getUserToken();
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe("oussama@example.com");
            expect(res.body.data.password).toBeUndefined();
        });
    });
});
