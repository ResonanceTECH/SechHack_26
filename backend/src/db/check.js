import { pool } from "./pool.js";

const { rows } = await pool.query("SELECT NOW() AS now, current_database() AS db");
console.log("OK:", rows[0]);
await pool.end();
