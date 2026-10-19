import express from "express";
import cors from "cors";
import "dotenv/config";
import { pool } from "./db/pool.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/db/health", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT NOW() AS now, current_database() AS db"
    );
    res.json({ ok: true, ...rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
