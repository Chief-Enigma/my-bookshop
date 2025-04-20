/**
 * OrderController
 * ---------------
 * Beinhaltet die Business‑Logik für Bestellungen:
 * - Anlage neuer Bestellungen (inkl. Berechnung des Gesamtbetrags)
 * - Abruf aller Bestellungen eines bestimmten Users
 * 
 * Arbeitet auf Basis des OrderExcelService (Persistenz) und
 * BookExcelService (Preis‑Lookup).
 */

import { v4 as uuidv4 } from 'uuid';
import OrderExcelService from '../services/OrderExcelService';
import BookExcelService from '../services/BookExcelService';
import type { Order, OrderItem } from '../models/Order';

export default class OrderController {
  /**
   * Legt eine neue Bestellung an.
   * - Liest existierende Orders aus Excel.
   * - Lädt alle Bücher, um den Gesamtbetrag zu berechnen.
   * - Erzeugt eine neue Order mit UUID, Zeitstempel und Status "pending".
   * - Schreibt die aktualisierte Order‑Liste zurück in Excel.
   * 
   * @param userId   ID des Users, der bestellt
   * @param items    Array von OrderItem { bookId, quantity }
   * @returns {Order}  Das neu erstellte Order‑Objekt
   * @example
   * const newOrder = OrderController.create('user-123', [
   *   { bookId: 'book-456', quantity: 2 },
   *   { bookId: 'book-789', quantity: 1 }
   * ]);
   * console.log('Order-ID:', newOrder.id, 'Total:', newOrder.totalAmount);
   */
  static create(userId: string, items: OrderItem[]): Order {
    // Alle bisherigen Bestellungen laden
    const orders = OrderExcelService.readOrders();

    // Bücher laden für Preisberechnung
    const books = BookExcelService.readBooks();

    // Gesamtbetrag berechnen
    const total = items.reduce((sum, it) => {
      const book = books.find(b => b.id === it.bookId);
      return sum + (book ? book.price * it.quantity : 0);
    }, 0);

    // Neue Bestellung erzeugen
    const newOrder: Order = {
      id: uuidv4(),
      userId,
      items,
      totalAmount: total,
      orderDate: new Date().toISOString(),
      status: 'pending',
    };

    // Speichern und zurückgeben
    orders.push(newOrder);
    OrderExcelService.writeOrders(orders);
    return newOrder;
  }

  /**
   * Liefert alle Bestellungen eines bestimmten Users.
   * 
   * @param userId  ID des Users
   * @returns {Order[]}  Array aller Bestellungen dieses Users
   * @example
   * const myOrders = OrderController.listByUser('user-123');
   * console.log(`Du hast ${myOrders.length} Bestellungen.`);
   */
  static listByUser(userId: string): Order[] {
    return OrderExcelService
      .readOrders()
      .filter(o => o.userId === userId);
  }
}