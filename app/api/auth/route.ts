/**
 * Auth API‑Route
 * ==============
 * Bietet Endpoints für Nutzer‑Registrierung (signup), Anmeldung (login),
 * Session‑Abfrage (GET) und Logout (DELETE).  
 * Responses enthalten JSON‑Payloads und setzen bzw. löschen ein HTTP‑Only‑Cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sealData, unsealData } from 'iron-session';
import AuthController from '@/controllers/AuthController';
import { sessionOptions, COOKIE_NAME } from '@/utils/session';

/**
 * POST /api/auth?action=signup|login
 * ----------------------------------
 * - signup: Erstellt einen neuen User, setzt die Session und liefert den
 *   User als JSON mit HTTP‑Status 201 zurück.
 * - login:  Prüft E‑Mail + Passwort, setzt die Session und liefert den
 *   User als JSON mit HTTP‑Status 200 zurück.
 *
 * Erwarteter Request‑Body (JSON):
 *  - signup: { firstName, lastName, email, password, role }
 *  - login:  { email, password }
 *
 * Antwort:
 *  - { id, firstName, lastName, email, role, createdAt }
 *  - bei Fehler: { error: string }, Status 400 oder 401
 *
 * Setzt ein verschlüsseltes Cookie:
 *  Set-Cookie: bookshop_session=<sealedData>; Path=/; HttpOnly; Secure; SameSite=Strict
 *
 * @example Registrierung
 * fetch('/api/auth?action=signup', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ firstName:'Max',lastName:'Must',email:'m@a.ch',password:'pw',role:'customer' })
 * });
 *
 * @example Anmeldung
 * fetch('/api/auth?action=login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email:'m@a.ch',password:'pw' }),
 *   credentials: 'include'
 * });
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const body = await request.json();

  if (action === 'signup') {
    const user = AuthController.signup(body);
    const sessionData = { id: user.id, email: user.email, role: user.role };
    const ck = await sealData(sessionData, sessionOptions);
    const res = NextResponse.json(user, { status: 201 });
    res.headers.set(
      'Set-Cookie',
      `${COOKIE_NAME}=${ck}; Path=/; HttpOnly; Secure; SameSite=Strict`
    );
    return res;
  }

  if (action === 'login') {
    const user = AuthController.login(body.email, body.password);
    const sessionData = { id: user.id, email: user.email, role: user.role };
    const ck = await sealData(sessionData, sessionOptions);
    const res = NextResponse.json(user, { status: 200 });
    res.headers.set(
      'Set-Cookie',
      `${COOKIE_NAME}=${ck}; Path=/; HttpOnly; Secure; SameSite=Strict`
    );
    return res;
  }

  return NextResponse.json(
    { error: 'Invalid action – verwende signup oder login' },
    { status: 400 }
  );
}

/**
 * GET /api/auth
 * -------------
 * Liest das Session‑Cookie aus und entschlüsselt es.
 * Antwortet mit { user: SessionData } oder { user: null }.
 *
 * @example Session abfragen
 * fetch('/api/auth', { credentials: 'include' })
 *   .then(res => res.json())
 *   .then(data => console.log(data.user));
 */
export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ user: null });
  }

  const data = await unsealData(cookie, sessionOptions);
  return NextResponse.json({ user: data });
}

/**
 * DELETE /api/auth
 * ----------------
 * Loggt den User aus, indem das Session‑Cookie sofort abläuft.
 * Antwortet mit { user: null }.
 *
 * @example Logout
 * fetch('/api/auth', { method: 'DELETE', credentials: 'include' });
 */
export async function DELETE() {
  const res = NextResponse.json({ user: null });
  res.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
  );
  return res;
}