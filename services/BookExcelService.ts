/**
 * BookExcelService
 * ----------------
 * Persistiert Book‑Datensätze in einer Excel‑Datei unter `data/books.xlsx`.
 * Diese Komponente kapselt alle Dateisystem‑ und XLSX‑Details und stellt
 * eine einfache API zum Lesen und Schreiben von Book‑Objekten bereit.
 */

import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { Book } from '../models/Book';

/** Vollständiger Pfad zur Excel‑Datei für Books */
const BOOK_PATH = path.resolve(process.cwd(), 'data', 'books.xlsx');
/** Kopfzeilen (Spalten) im Excel‑Sheet „Books“ */
const BOOK_HEADERS = [
  'id',
  'title',
  'author',
  'price',
  'genre',
  'pageCount',
  'stock',
  'imageUrl',
  'ownerId',
  'createdAt'
];

/**
 * Stellt sicher, dass das Verzeichnis und die Excel‑Datei existieren.
 * - Legt bei Bedarf das Verzeichnis `data/` an.
 * - Initialisiert `books.xlsx` mit einer leeren Kopfzeile.
 */
function ensureFile() {
  const dir = path.dirname(BOOK_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(BOOK_PATH)) {
    // Neues Workbook anlegen
    const wb = XLSX.utils.book_new();
    // Sheet „Books“ mit nur einer Kopfzeile erzeugen
    const ws = XLSX.utils.aoa_to_sheet([BOOK_HEADERS]);
    XLSX.utils.book_append_sheet(wb, ws, 'Books');
    // Puffer erzeugen und in Datei schreiben
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(BOOK_PATH, buf);
  }
}

export default {
  /**
   * Liest alle Book‑Einträge aus der Excel‑Datei aus.
   * @returns {Book[]} Array aller Bücher, ggf. leer.
   * @example
   * const books = BookExcelService.readBooks();
   * console.log(books[0].title);
   */
  readBooks(): Book[] {
    ensureFile();
    // Datei als Buffer einlesen
    const data = fs.readFileSync(BOOK_PATH);
    // Buffer mit XLSX einlesen
    const wb = XLSX.read(data, { type: 'buffer' });
    const ws = wb.Sheets['Books'];
    // Sheet zu JSON parsen, fehlende Zellen als leere Strings
    return XLSX.utils.sheet_to_json<Book>(ws, { defval: '' });
  },

  /**
   * Überschreibt das Excel‑Sheet „Books“ mit den übergebenen Book‑Objekten.
   * @param {Book[]} books - Array von Büchern zum Speichern.
   * @example
   * const books = BookExcelService.readBooks();
   * books.push(newBook);
   * BookExcelService.writeBooks(books);
   */
  writeBooks(books: Book[]): void {
    ensureFile();
    // Aktuelle Datei einlesen
    const data = fs.readFileSync(BOOK_PATH);
    const wb = XLSX.read(data, { type: 'buffer' });
    // JSON‑Array in ein Sheet umwandeln, Kopfzeilen vorgeben
    const ws = XLSX.utils.json_to_sheet(books, { header: BOOK_HEADERS });
    // Altes „Books“‑Sheet ersetzen
    wb.Sheets['Books'] = ws;
    // Sicherstellen, dass nur dieses eine Sheet existiert
    wb.SheetNames = ['Books'];
    // Workbook schreiben und speichern
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(BOOK_PATH, buf);
  },
};