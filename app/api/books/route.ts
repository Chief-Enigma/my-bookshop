/**
 * Books API‑Route
 * ===============
 * Bietet CRUD‑Endpoints für Bücher:
 * - GET    /api/books      → Liste aller Bücher (für Kunden) oder nur eigene (für Admins)
 * - POST   /api/books      → Neues Buch anlegen (nur Admins)
 * - PATCH  /api/books      → Bestehendes Buch aktualisieren (nur Admins, nur eigene)
 * - DELETE /api/books      → Buch löschen (nur Admins, nur eigene)
 *
 * Alle Endpoints prüfen die Session via `bookshop_session`‑Cookie und
 * geben bei fehlender oder ungültiger Session 401 zurück. Admin‑Routen
 * (POST, PATCH, DELETE) geben bei falscher Rolle 403 bzw. bei fehlendem
 * Eigentümer-Check 404 zurück.
 */

import { NextRequest, NextResponse } from 'next/server';
import { unsealData } from 'iron-session';
import BookController from '@/controllers/BookController';
import { sessionOptions, COOKIE_NAME } from '@/utils/session';
import type { Book } from '@/models/Book';

/** Struktur der entschlüsselten Session‑Daten */
type SessionData = {
  id: string;
  email: string;
  role: 'customer' | 'admin';
};

/**
 * GET /api/books
 * ---------------
 * - Admins: nur Bücher zurückgeben, deren `ownerId` zur Session‑User‑ID passt.
 * - Kunden: alle Bücher zurückgeben.
 *
 * @returns {Book[]} Array von Book‑Objekten
 * @status 200 OK
 * @status 401 Unauthorized  Wenn kein gültiges Session‑Cookie vorliegt
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

  // Rollen‑basiertes Filtern
  const allBooks = BookController.listAll();
  const books = session.role === 'admin'
    ? allBooks.filter(b => b.ownerId === session.id)
    : allBooks;

  return NextResponse.json(books, { status: 200 });
}

/**
 * POST /api/books
 * ----------------
 * Legt ein neues Buch an. Nur für Admins erlaubt.
 *
 * Erwarteter Request‑Body (JSON):
 * {
 *   title: string;
 *   author: string;
 *   price: number;
 *   genre: Genre;
 *   pageCount: number;
 *   stock: number;
 *   imageUrl: string;
 *   // ownerId wird automatisch aus Session gesetzt
 * }
 *
 * @returns {Book} Das neu angelegte Buch
 * @status 201 Created
 * @status 401 Unauthorized  Wenn keine Session
 * @status 403 Forbidden     Wenn Rolle ≠ 'admin'
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

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const book = BookController.add({
    ...body,
    ownerId: session.id,
  });

  return NextResponse.json(book, { status: 201 });
}

/**
 * PATCH /api/books
 * -----------------
 * Aktualisiert ein bestehendes Buch. Nur für Admins erlaubt, nur eigene Bücher.
 *
 * Erwarteter Request‑Body (JSON):
 * {
 *   id: string;
 *   // beliebige Teilfelder von Book außer id, createdAt
 *   title?: string;
 *   author?: string;
 *   price?: number;
 *   genre?: Genre;
 *   pageCount?: number;
 *   stock?: number;
 *   imageUrl?: string;
 * }
 *
 * @returns {Book} Das aktualisierte Buch
 * @status 200 OK
 * @status 400 Bad Request  Bei fehlender ID oder fehlerhaften Daten
 * @status 401 Unauthorized Wenn keine Session
 * @status 403 Forbidden    Wenn Rolle ≠ 'admin'
 * @status 404 Not Found    Wenn Buch nicht existiert oder nicht Eigentümer
 */
export async function PATCH(request: NextRequest) {
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

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, ...updates } = await request.json();
  const existing = BookController.listAll().find(b => b.id === id);

  // Prüfen, ob Buch existiert und User Eigentümer ist
  if (!existing || existing.ownerId !== session.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }

  try {
    const updated = BookController.update(id, updates);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

/**
 * DELETE /api/books
 * ------------------
 * Löscht ein Buch anhand seiner ID. Nur für Admins erlaubt, nur eigene Bücher.
 *
 * Erwarteter Request‑Body (JSON):
 * { id: string }
 *
 * @returns {{ success: true }}
 * @status 200 OK
 * @status 401 Unauthorized Wenn keine Session
 * @status 403 Forbidden    Wenn Rolle ≠ 'admin'
 * @status 404 Not Found    Wenn Buch nicht existiert oder nicht Eigentümer
 */
export async function DELETE(request: NextRequest) {
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

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await request.json();
  const existing = BookController.listAll().find(b => b.id === id);
  if (!existing || existing.ownerId !== session.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }

  BookController.delete(id);
  return NextResponse.json({ success: true }, { status: 200 });
}