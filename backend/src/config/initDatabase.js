const fs = require("fs");
const path = require("path");
const db = require("./database");

const schemaPath = path.join(__dirname, "../../database/schema.sql");

const schema = fs.readFileSync(schemaPath, "utf-8");

db.exec(schema);

console.log("Database schema created successfully");

db.close();