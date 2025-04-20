'use client';

import React from 'react';
import type { Book } from '@/models/Book';
import styles from './BookTable.module.css';

interface Props {
  books: Book[];
  onEdit: (book: Book) => void;
}

export default function BookTable({ books, onEdit }: Props) {
  if (books.length === 0) {
    return <p className={styles.empty}>Keine Daten vorhanden</p>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Titel</th>
          <th>Autor</th>
          <th>Preis</th>
          <th>Genre</th>
          <th>Seiten</th>
          <th>Bestand</th>
          <th>Aktion</th>
        </tr>
      </thead>
      <tbody>
        {books.map(b => (
          <tr key={b.id}>
            <td>{b.title}</td>
            <td>{b.author}</td>
            <td className={styles.right}>{b.price.toFixed(2)} CHF</td>
            <td>{b.genre}</td>
            <td className={styles.right}>{b.pageCount}</td>
            <td className={styles.right}>{b.stock}</td>
            <td>
              <button className={styles.editButton} onClick={() => onEdit(b)}>
                Bearbeiten
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
