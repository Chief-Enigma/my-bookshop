/**
 * UserExcelService
 * ----------------
 * Persistiert User‑Datensätze in einer Excel‑Datei unter `data/users.xlsx`.
 * Diese Komponente kapselt alle Dateisystem‑ und XLSX‑Details und stellt
 * eine einfache API zum Lesen und Schreiben von User‑Objekten bereit.
 */

import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { User } from '../models/User';

/** Vollständiger Pfad zur Excel‑Datei für Users */
const USER_PATH = path.resolve(process.cwd(), 'data', 'users.xlsx');
/** Kopfzeilen (Spalten) im Excel‑Sheet „Users“ */
const HEADERS = ['id', 'firstName', 'lastName', 'email', 'password', 'role', 'createdAt'];

/**
 * Stellt sicher, dass das Verzeichnis und die Excel‑Datei existieren.
 * - Legt bei Bedarf das Verzeichnis `data/` an.
 * - Initialisiert `users.xlsx` mit einer leeren Kopfzeile.
 */
function ensureFile() {
  const dir = path.dirname(USER_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USER_PATH)) {
    // Neues Workbook anlegen
    const wb = XLSX.utils.book_new();
    // Sheet „Users“ mit nur einer Kopfzeile erzeugen
    const ws = XLSX.utils.aoa_to_sheet([HEADERS]);
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    // Puffer erzeugen und in Datei schreiben
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(USER_PATH, buf);
  }
}

export default {
  /**
   * Liest alle User‑Einträge aus der Excel‑Datei aus.
   * @returns {User[]} Array aller User, ggf. leer.
   * @example
   * const users = UserExcelService.readUsers();
   * console.log(users[0].email);
   */
  readUsers(): User[] {
    ensureFile();
    // Datei als Buffer einlesen
    const data = fs.readFileSync(USER_PATH);
    // Buffer mit XLSX einlesen
    const wb = XLSX.read(data, { type: 'buffer' });
    const ws = wb.Sheets['Users'];
    // Sheet zu JSON parsen, fehlende Zellen als leere Strings
    return XLSX.utils.sheet_to_json<User>(ws, { defval: '' });
  },

  /**
   * Überschreibt das Excel‑Sheet „Users“ mit den übergebenen User‑Objekten.
   * @param {User[]} users - Array von User‑Objekten zum Speichern.
   * @example
   * const users = UserExcelService.readUsers();
   * users.push(newUser);
   * UserExcelService.writeUsers(users);
   */
  writeUsers(users: User[]): void {
    ensureFile();
    // Aktuelle Datei einlesen
    const data = fs.readFileSync(USER_PATH);
    const wb = XLSX.read(data, { type: 'buffer' });
    // JSON‑Array in ein Sheet umwandeln, Kopfzeilen vorgeben
    const ws = XLSX.utils.json_to_sheet(users, { header: HEADERS });
    // Altes „Users“‑Sheet ersetzen
    wb.Sheets['Users'] = ws;
    // Sicherstellen, dass nur dieses eine Sheet existiert
    wb.SheetNames = ['Users'];
    // Workbook schreiben und speichern
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(USER_PATH, buf);
  },
};