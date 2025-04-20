/**
 * Orders API‑Route
 * ================
 * Bietet Endpoints für das Anlegen und Abfragen von Bestellungen:
 * - POST  /api/orders   → Neue Bestellung anlegen (nur für eingeloggte User)
 * - GET   /api/orders   → Bestellungen des eingeloggten Users abrufen
 *
 * Beide Endpoints prüfen die Session via `bookshop_session`‑Cookie und
 * geben bei fehlender oder ungültiger Session 401 zurück.
 */

import { NextRequest, NextResponse } from 'next/server';
import { unsealData } from 'iron-session';
import OrderController from '@/controllers/OrderController';
import { sessionOptions, COOKIE_NAME } from '@/utils/session';
import type { OrderItem } from '@/models/Order';

/** Struktur der entschlüsselten Session‑Daten */
type SessionData = {
  id: string;
  email: string;
  role: 'customer' | 'admin';
};

/**
 * POST /api/orders
 * ----------------
 * Legt eine neue Bestellung an.
 * - Liest das Session‑Cookie und entschlüsselt es.
 * - Verifiziert, dass der User eingeloggt ist.
 * - Erwartet im Body:
 *   {
 *     items: OrderItem[],       // Array mit { bookId, quantity }
 *     paymentMethod: string     // z.B. 'ghost' oder 'cash'
 *   }
 * - Ruft OrderController.create(userId, items) auf.
 * - Gibt die neu erstellte Bestellung als JSON zurück.
 *
 * @returns {Order}    Das erstellte Order‑Objekt
 * @status 201 Created
 * @status 401 Unauthorized  Wenn keine gültige Session
 *
 * @example
 * fetch('/api/orders', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   credentials: 'include',
 *   body: JSON.stringify({
 *     items: [{ bookId: 'abc', quantity: 2 }],
 *     paymentMethod: 'ghost'
 *   })
 * });
 */
export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let session: SessionData;
  try {
    session = await unsealData<SessionData>(cookie, sessionOptions);
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // User‑ID muss vorhanden sein
  if (!session.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { items, paymentMethod } = (await request.json()) as {
    items: OrderItem[];
    paymentMethod: string;
  };

  const order = OrderController.create(session.id, items);
  return NextResponse.json(order, { status: 201 });
}

/**
 * GET /api/orders
 * ---------------
 * Ruft alle Bestellungen des eingeloggten Users ab.
 * - Liest das Session‑Cookie und entschlüsselt es.
 * - Verifiziert, dass der User eingeloggt ist.
 * - Ruft OrderController.listByUser(userId) auf.
 * - Gibt Array von Order‑Objekten als JSON zurück.
 *
 * @returns {Order[]}  Array aller Bestellungen des Users
 * @status 200 OK
 * @status 401 Unauthorized  Wenn keine gültige Session
 *
 * @example
 * fetch('/api/orders', { credentials: 'include' })
 *   .then(r => r.json())
 *   .then(orders => console.log(orders));
 */
export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let session: SessionData;
  try {
    session = await unsealData<SessionData>(cookie, sessionOptions);
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const orders = OrderController.listByUser(session.id);
  return NextResponse.json(orders, { status: 200 });
}