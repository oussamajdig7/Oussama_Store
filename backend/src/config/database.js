const Database = require('better-sqlite3');

const path = require('path');

const dbpath = path.join(__dirname,"../../database/ecommerce.db");

const db = new Database(dbpath);

db.pragma('foreign_keys = ON');

console.log("Database connected successfully");

module.exports = db;