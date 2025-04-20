
'use client';

import React, { useEffect, useState } from 'react';
import type { Order, OrderItem } from '@/models/Order';
import type { Book } from '@/models/Book';
import styles from './orders.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then((data: Order[]) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/books', { credentials: 'include' })
      .then(r => r.json())
      .then((data: Book[]) => setBooks(Array.isArray(data) ? data : []));
  }, []);

  if (loading) {
    return <p className={styles.empty}>Lade Bestellungen …</p>;
  }
  if (orders.length === 0) {
    return <p className={styles.empty}>Du hast noch keine Bestellungen.</p>;
  }

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Meine Bestellungen</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Bestell‑ID</th>
            <th>Datum</th>
            <th>Status</th>
            <th className={styles.right}>Summe</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const detailItems = o.items
              .map((it: OrderItem) => {
                const book = books.find(b => b.id === it.bookId);
                if (!book) return null;
                return {
                  ...it,
                  title: book.title,
                  author: book.author,
                  price: book.price,
                  lineTotal: book.price * it.quantity,
                };
              })
              .filter(Boolean) as Array<
              OrderItem & {
                title: string;
                author: string;
                price: number;
                lineTotal: number;
              }
            >;

            return (
              <React.Fragment key={o.id}>
                <tr className={styles.row}>
                  <td>{o.id}</td>
                  <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td>{o.status}</td>
                  <td className={styles.right}>
                    {o.totalAmount.toFixed(2)} CHF
                  </td>
                  <td>
                    <button
                      className={styles.expandBtn}
                      onClick={() => toggle(o.id)}
                    >
                      {expanded === o.id ? '−' : '+'}
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className={styles.detailRow}>
                    <td colSpan={5}>
                      <table className={styles.innerTable}>
                        <thead>
                          <tr>
                            <th>Titel</th>
                            <th>Autor</th>
                            <th className={styles.right}>Einzelpreis</th>
                            <th className={styles.right}>Menge</th>
                            <th className={styles.right}>Zeile gesamt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailItems.map((di, idx) => (
                            <tr key={idx}>
                              <td>{di.title}</td>
                              <td>{di.author}</td>
                              <td className={styles.right}>
                                {di.price.toFixed(2)} CHF
                              </td>
                              <td className={styles.right}>{di.quantity}</td>
                              <td className={styles.right}>
                                {di.lineTotal.toFixed(2)} CHF
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
