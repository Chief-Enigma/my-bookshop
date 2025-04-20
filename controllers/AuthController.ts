/**
 * AuthController
 * --------------
 * Beinhaltet die Business‑Logik für Benutzerregistrierung (Signup)
 * und Anmeldungsprüfung (Login). Nutzt UserExcelService als Persistenz‑Layer.
 */

import { v4 as uuidv4 } from 'uuid';
import UserExcelService from '../services/UserExcelService';
import { User } from '../models/User';

export default class AuthController {
  /**
   * Registriert einen neuen Benutzer und speichert ihn in Excel.
   * - Validiert, dass die E‑Mail noch nicht existiert.
   * - Erzeugt eine neue UUID, ein Erstellungsdatum und schreibt den User in die Datei.
   *
   * @param data.firstName  Vorname des Benutzers
   * @param data.lastName   Nachname des Benutzers
   * @param data.email      E‑Mail (wird als Login‑Name genutzt)
   * @param data.password   Klartext‑Passwort (in der Übung so belassen)
   * @param data.role       Rolle: 'customer' oder 'admin'
   * @returns {User}        Das frisch angelegte User‑Objekt
   * @throws {Error}       Wenn die E‑Mail bereits registriert ist
   *
   * @example
   * const newUser = AuthController.signup({
   *   firstName: 'Anna',
   *   lastName: 'Muster',
   *   email: 'anna@beispiel.ch',
   *   password: 'supergeheim',
   *   role: 'customer'
   * });
   * console.log(newUser.id, newUser.createdAt);
   */
  static signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'customer' | 'admin';
  }): User {
    // Alle existierenden User aus Excel laden
    const users = UserExcelService.readUsers();

    // E‑Mail‐Uniqueness prüfen
    if (users.some(u => u.email === data.email)) {
      throw new Error('Email bereits registriert');
    }

    // Neues User‑Objekt erzeugen
    const newUser: User = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    // In die Excel‑Datei schreiben
    const updated = [...users, newUser];
    UserExcelService.writeUsers(updated);

    return newUser;
  }

  /**
   * Prüft Login‑Daten und liefert den passenden User zurück.
   * - Liest alle User aus Excel, vergleicht E‑Mail + Passwort.
   *
   * @param email       E‑Mail des Benutzers
   * @param password    Klartext‑Passwort
   * @returns {User}   Den gefundenen User
   * @throws {Error}  Wenn keine Übereinstimmung gefunden wurde
   *
   * @example
   * try {
   *   const user = AuthController.login('anna@beispiel.ch', 'supergeheim');
   *   console.log('Eingeloggt als', user.email);
   * } catch (err) {
   *   console.error('Login fehlgeschlagen:', err.message);
   * }
   */
  static login(email: string, password: string): User {
    // Alle existierenden User aus Excel laden
    const users = UserExcelService.readUsers();

    // E‑Mail + Passwort abgleichen
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Ungültige Zugangsdaten');
    }

    return user;
  }
}