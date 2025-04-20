/**
 * OrderExcelService
 * -----------------
 * Persistiert Order‑Datensätze in einer Excel‑Datei unter `data/orders.xlsx`.
 * Diese Komponente kapselt alle Dateisystem‑ und XLSX‑Details und stellt
 * eine einfache API zum Lesen und Schreiben von Order‑Objekten bereit.
 */

import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { Order, OrderItem } from '../models/Order';

/** Vollständiger Pfad zur Excel‑Datei für Orders */
const ORDER_PATH = path.resolve(process.cwd(), 'data', 'orders.xlsx');
/** Kopfzeilen (Spalten) im Excel‑Sheet „Orders“ */
const ORDER_HEADERS = [
  'id',
  'userId',
  'items',      // JSON‑Stringified OrderItem[]
  'totalAmount',
  'orderDate',
  'status'
];

/**
 * Stellt sicher, dass das Verzeichnis und die Excel‑Datei existieren.
 * - Legt bei Bedarf das Verzeichnis `data/` an.
 * - Initialisiert `orders.xlsx` mit einer leeren Kopfzeile.
 */
function ensureFile() {
  const dir = path.dirname(ORDER_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(ORDER_PATH)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([ORDER_HEADERS]);
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(ORDER_PATH, buf);
  }
}

export default {
  /**
   * Liest alle Orders aus der Excel‑Datei aus.
   * Parsiert das JSON‑Array im `items`‑Feld zurück in OrderItem[].
   * @returns {Order[]} Array aller Bestellungen, ggf. leer.
   * @example
   * const orders = OrderExcelService.readOrders();
   * console.log(orders[0].items[0].quantity);
   */
  readOrders(): Order[] {
    ensureFile();
    const data = fs.readFileSync(ORDER_PATH);
    const wb = XLSX.read(data, { type: 'buffer' });
    const ws = wb.Sheets['Orders'];
    // Zuerst als generisches JSON lesen
    const raw = XLSX.utils.sheet_to_json<any>(ws, { defval: '' }) as any[];
    // Dann in korrekt typisierte Order‑Objekte umwandeln
    return raw.map(r => ({
      id: String(r.id),
      userId: String(r.userId),
      items: JSON.parse(r.items) as OrderItem[],
      totalAmount: Number(r.totalAmount),
      orderDate: String(r.orderDate),
      status: String(r.status) as Order['status'],
    }));
  },

  /**
   * Überschreibt das Excel‑Sheet „Orders“ mit den übergebenen Order‑Objekten.
   * Serialisiert das `items`‑Array in einen JSON‑String.
   * @param {Order[]} orders - Array von Bestellungen zum Speichern.
   * @example
   * const orders = OrderExcelService.readOrders();
   * orders.push({ id: 'xyz', userId: '123', items: [...], totalAmount: 59.80, orderDate: new Date().toISOString(), status: 'pending' });
   * OrderExcelService.writeOrders(orders);
   */
  writeOrders(orders: Order[]): void {
    ensureFile();
    const data = fs.readFileSync(ORDER_PATH);
    const wb = XLSX.read(data, { type: 'buffer' });
    // items‑Array serialisieren
    const payload = orders.map(o => ({
      ...o,
      items: JSON.stringify(o.items),
    }));
    const ws = XLSX.utils.json_to_sheet(payload, { header: ORDER_HEADERS });
    wb.Sheets['Orders'] = ws;
    wb.SheetNames = ['Orders'];
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(ORDER_PATH, buf);
  },
};