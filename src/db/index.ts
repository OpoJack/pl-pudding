import { Database } from "bun:sqlite";
import { config } from "../config";

class DB {
  private static instance: Database;

  static getInstance(): Database {
    if (!DB.instance) {
      DB.instance = new Database(config.database.url);

      // Enable foreign keys
      DB.instance.exec("PRAGMA foreign_keys = ON;");

      // Enable WAL mode for better concurrency
      DB.instance.exec("PRAGMA journal_mode = WAL;");
    }
    return DB.instance;
  }
}

export const db = DB.getInstance();
