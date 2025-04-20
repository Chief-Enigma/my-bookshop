/**
 * Session‑Konfiguration für Iron‑Session
 * --------------------------------------
 * Definiert Typen und Optionen für die serverseitige Session‑Verwaltung
 * mittels `iron-session`. Sessions werden in einem HTTP‑Only‑Cookie
 * namens `bookshop_session` gespeichert und verschlüsselt.
 */

import type { SessionOptions } from 'iron-session';

/**
 * Struktur eines eingeloggten Users in der Session.
 * @property id      Eindeutige User‑ID (UUID)
 * @property email   E‑Mail‑Adresse des Users
 * @property role    Rolle des Users: 'customer' | 'admin'
 */
export type SessionUser = {
  id: string;
  email: string;
  role: 'customer' | 'admin';
};

/**
 * Zusätzliche Daten, die in der Session gespeichert werden.
 * Das Feld `user` ist optional – existiert nur nach Login.
 */
export type SessionData = {
  user?: SessionUser;
};

/** Name des Cookies, in dem die Session gespeichert wird. */
export const COOKIE_NAME = 'bookshop_session';

/**
 * Optionen zur Initialisierung von Iron‑Session.
 * 
 * @see https://github.com/vvo/iron-session#options
 */
export const sessionOptions: SessionOptions = {
  // Passwort zum Verschlüsseln der Session. Muss >= 32 Zeichen lang sein.
  password: process.env.SESSION_SECRET as string,

  // Cookie‑Name wie oben definiert
  cookieName: COOKIE_NAME,

  // Cookie‑Optionen:
  // - secure: true in Produktion → nur über HTTPS  
  // - httpOnly, sameSite und Path werden intern gesetzt
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};