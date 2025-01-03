import { db } from "../index";
import { AuditLog } from "./types";

export class AuditLogModel {
  static async create(log: Omit<AuditLog, "id" | "timestamp">): Promise<string> {
    const id = crypto.randomUUID();
    const query = db.prepare(`
      INSERT INTO audit_log (id, table_name, record_id, action, old_data, new_data, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    query.run(
      id,
      log.table_name,
      log.record_id,
      log.action,
      log.old_data ? JSON.stringify(log.old_data) : null,
      log.new_data ? JSON.stringify(log.new_data) : null,
      log.user_id
    );

    return id;
  }

  static async getLogsForRecord(tableName: string, recordId: string): Promise<AuditLog[]> {
    const query = db.prepare(
      "SELECT * FROM audit_log WHERE table_name = ? AND record_id = ? ORDER BY timestamp DESC"
    );
    return query.all(tableName, recordId) as AuditLog[];
  }
}
