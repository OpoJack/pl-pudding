import { db } from "../index";
import { ErrorLog } from "./types";

export class ErrorLogModel {
  static async create(error: Omit<ErrorLog, "id" | "resolved" | "created_at">): Promise<string> {
    const id = crypto.randomUUID();
    const query = db.prepare(`
      INSERT INTO error_log (id, service, error_type, error_message, error_data)
      VALUES (?, ?, ?, ?, ?)
    `);

    query.run(
      id,
      error.service,
      error.error_type,
      error.error_message,
      error.error_data ? JSON.stringify(error.error_data) : null
    );

    return id;
  }

  static async markResolved(id: string): Promise<void> {
    const query = db.prepare("UPDATE error_log SET resolved = TRUE WHERE id = ?");
    query.run(id);
  }

  static async getUnresolved(service?: string): Promise<ErrorLog[]> {
    const query = service
      ? db.prepare(
          "SELECT * FROM error_log WHERE resolved = FALSE AND service = ? ORDER BY created_at DESC"
        )
      : db.prepare("SELECT * FROM error_log WHERE resolved = FALSE ORDER BY created_at DESC");

    return (service ? query.all(service) : query.all()) as ErrorLog[];
  }
}
