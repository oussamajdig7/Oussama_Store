const request = require("supertest");
const app = require("../src/server");

let cachedAdminToken = null;
let cachedUserToken = null;

async function getAdminToken() {
    if (cachedAdminToken) return cachedAdminToken;
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@example.com", password: "Admin123!" });
    if (res.body?.data?.token) {
        cachedAdminToken = res.body.data.token;
        return cachedAdminToken;
    }
    throw new Error(`Failed to get admin token: ${JSON.stringify(res.body)}`);
}

async function getUserToken() {
    if (cachedUserToken) return cachedUserToken;
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "oussama@example.com", password: "Password123!" });
    if (res.body?.data?.token) {
        cachedUserToken = res.body.data.token;
        return cachedUserToken;
    }
    throw new Error(`Failed to get user token: ${JSON.stringify(res.body)}`);
}

module.exports = {
    app,
    request,
    getAdminToken,
    getUserToken,
};
