import { seed2026Courses } from "./seed-2026-courses.js";
import { pool } from "../config/db.js";

async function run() {
  try {
    await seed2026Courses();
    console.log("SUCCESS");
  } catch (err) {
    console.error("SEED_ERROR:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
