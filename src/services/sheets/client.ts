import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { config } from "../../config";
import { PNLRow } from "./types";

export class GoogleSheetsClient {
  private doc: GoogleSpreadsheet;
  private initialized = false;

  constructor() {
    const auth = new JWT({
      email: config.googleSheets.clientEmail,
      key: config.googleSheets.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.doc = new GoogleSpreadsheet(config.googleSheets.spreadsheetId, auth);
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.doc.loadInfo();
      this.initialized = true;
    }
  }

  async setupSheet() {
    await this.ensureInitialized();

    // Get or create the PNL sheet
    let sheet = this.doc.sheetsByTitle["PNL"];
    if (!sheet) {
      sheet = await this.doc.addSheet({
        title: "PNL",
        headerValues: [
          "Order Date",
          "Last Updated",
          "Order Source",
          "Order ID",
          "SKU",
          "Gross Sale",
          "Ad Fees",
          "Other Fees",
          "Shipping",
          "Cost",
          "Profit",
          "Shipping Status",
        ],
      });

      // Set up formatting
      await sheet.loadCells();

      // Format headers
      //   const headerRow = sheet.getRows({ offset: 0, limit: 1 });
      for (let i = 0; i < 12; i++) {
        const cell = sheet.getCell(0, i);
        cell.textFormat = { bold: true };
        cell.backgroundColor = { red: 0.9, green: 0.9, blue: 0.9 };
      }

      // Format currency columns
      const currencyColumns = ["F", "G", "H", "I", "J", "K"]; // Columns for monetary values
      currencyColumns.forEach((col) => {
        const startingCellNumber = 1; // Skip header row
        for (let i = startingCellNumber; i < sheet.rowCount; i++) {
          const cell = sheet.getCell(i, col.charCodeAt(0) - 65); // Convert A->0, B->1, etc
          cell.numberFormat = {
            type: "CURRENCY",
            pattern: '"$"#,##0.00',
          };
        }
      });

      await sheet.saveUpdatedCells();
    }

    return sheet;
  }

  async addOrUpdateRows(rows: PNLRow[]) {
    await this.ensureInitialized();
    const sheet = await this.setupSheet();

    // Load existing rows to check for updates
    const existingRows = await sheet.getRows();

    for (const [index, row] of rows.entries()) {
      // Check if row exists
      const rowNumber = existingRows.length + index + 2; // +2 because of header row and 1-based indexing
      const existingRow = existingRows.find(
        (er) => er.get("Order ID") === row.orderId && er.get("SKU") === row.sku
      );

      if (existingRow) {
        // Update existing row
        existingRow.set("Order Date", row.orderDate);
        existingRow.set("Last Updated", row.lastUpdated);
        existingRow.set("Order Source", row.orderSource);
        existingRow.set("Gross Sale", row.grossSale);
        existingRow.set("Ad Fees", row.adFees);
        existingRow.set("Other Fees", row.otherFees);
        existingRow.set("Shipping", row.shipping);
        existingRow.set("Cost", row.cost);
        existingRow.set("Profit", row.profit);
        await existingRow.save();
      } else {
        const profitFormula = `=F${rowNumber}-G${rowNumber}-H${rowNumber}-I${rowNumber}-J${rowNumber}`;
        // Add new row
        await sheet.addRow({
          "Order Date": row.orderDate,
          "Last Updated": row.lastUpdated,
          "Order Source": row.orderSource,
          "Order ID": row.orderId,
          SKU: row.sku,
          "Gross Sale": row.grossSale,
          "Ad Fees": row.adFees,
          "Other Fees": row.otherFees,
          Shipping: row.shipping,
          Cost: row.cost,
          Profit: profitFormula,
          "Shipping Status": row.shippingStatus,
        });
      }
    }
  }

  async clearOldData(daysToKeep = 90) {
    await this.ensureInitialized();
    const sheet = await this.setupSheet();

    const rows = await sheet.getRows();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const rowsToDelete = rows.filter((row) => {
      const orderDate = new Date(row.get("Order Date"));
      return orderDate < cutoffDate;
    });

    for (const row of rowsToDelete) {
      await row.delete();
    }
  }
}
