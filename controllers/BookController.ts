/**
 * BookController
 * --------------
 * Beinhaltet die Business‑Logik für Buch‑Operationen:
 * - Listung aller Bücher
 * - Hinzufügen neuer Bücher
 * - Aktualisierung bestehender Bücher
 * - Löschen von Büchern
 * 
 * Arbeitet auf Basis des BookExcelService als Persistenz‑Layer.
 */

import { v4 as uuidv4 } from 'uuid';
import BookExcelService from '../services/BookExcelService';
import type { Book, Genre } from '../models/Book';

export default class BookController {
  /**
   * Listet alle Bücher aus der Excel‑Datei.
   * @returns {Book[]} Array aller vorhandenen Book‑Objekte.
   * @example
   * const allBooks = BookController.listAll();
   * console.log(`Aktuell ${allBooks.length} Bücher vorhanden.`);
   */
  static listAll(): Book[] {
    return BookExcelService.readBooks();
  }

  /**
   * Legt ein neues Buch an und speichert es in Excel.
   * - Erzeugt eine UUID als `id`.
   * - Ergänzt `createdAt` mit aktuellem Zeitstempel.
   * - Schreibt das aktualisierte Array zurück in die Datei.
   * 
   * @param data.title      Titel des Buches
   * @param data.author     Autor des Buches
   * @param data.price      Preis in CHF
   * @param data.genre      Genre (enum Genre)
   * @param data.pageCount  Seitenzahl
   * @param data.stock      Lagerbestand
   * @param data.imageUrl   Cover‑URL (kann leer sein)
   * @param data.ownerId    ID des anlegenden Users (Admin)
   * @returns {Book}        Das neu angelegte Book‑Objekt
   * @example
   * const newBook = BookController.add({
   *   title: '1984',
   *   author: 'George Orwell',
   *   price: 24.90,
   *   genre: 'Fiction',
   *   pageCount: 328,
   *   stock: 10,
   *   imageUrl: '',
   *   ownerId: 'admin-123'
   * });
   * console.log('Neues Buch ID:', newBook.id);
   */
  static add(data: {
    title: string;
    author: string;
    price: number;
    genre: Genre;
    pageCount: number;
    stock: number;
    imageUrl: string;
    ownerId: string;
  }): Book {
    const books = BookExcelService.readBooks();
    const newBook: Book = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    books.push(newBook);
    BookExcelService.writeBooks(books);
    return newBook;
  }

  /**
   * Aktualisiert ein bestehendes Buch.
   * - Sucht das Buch über die `id`.
   * - Überschreibt nur die übergebenen Felder (`data`).
   * - Speichert das aktualisierte Array zurück in Excel.
   * 
   * @param id               Die ID des zu aktualisierenden Buchs
   * @param data             Teilobjekt mit neuen Feldwerten
   * @returns {Book}         Das aktualisierte Book‑Objekt
   * @throws {Error}        Wenn kein Buch mit der gegebenen ID existiert
   * @example
   * const updated = BookController.update('book-123', {
   *   price: 19.90,
   *   stock: 5
   * });
   * console.log('Preis jetzt:', updated.price, 'Bestand:', updated.stock);
   */
  static update(id: string, data: Partial<Omit<Book, 'id' | 'createdAt'>>): Book {
    const books = BookExcelService.readBooks();
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) {
      throw new Error('Buch nicht gefunden');
    }
    const updated: Book = {
      ...books[idx],
      ...data,
    };
    books[idx] = updated;
    BookExcelService.writeBooks(books);
    return updated;
  }

  /**
   * Löscht ein Buch anhand seiner `id`.
   * - Filtert das Buch aus dem Array heraus.
   * - Speichert das gefilterte Array zurück in Excel.
   * 
   * @param id  Die ID des zu löschenden Buchs
   * @example
   * BookController.delete('book-123');
   * console.log('Buch gelöscht');
   */
  static delete(id: string): void {
    const books = BookExcelService.readBooks();
    const filtered = books.filter(b => b.id !== id);
    BookExcelService.writeBooks(filtered);
  }
}