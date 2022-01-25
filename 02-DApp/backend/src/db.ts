import mysql from "mysql";

const db = mysql.createPool({
    "connectionLimit": 10, 
    "host": process.env.DB_HOST,
    "user": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": "placeholder"
});

export default db;
