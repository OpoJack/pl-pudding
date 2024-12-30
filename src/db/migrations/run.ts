import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../index";

const migrationFiles = [
  "001_initial.sql",
  // Add more migration files as needed
];

for (const file of migrationFiles) {
  const sql = readFileSync(join(import.meta.dir, file), "utf8");
  db.run(sql);
}

console.log("Migrations completed");
