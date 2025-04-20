'use client';

import { useState, useEffect } from 'react';
import type { Book } from '@/models/Book';
import BookTable from './Components/BookTable';
import BookForm from './Components/BookForm';
import styles from './styles.module.css';

export default function InventoryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadBooks = async () => {
    try {
      const res = await fetch('/api/books', {
        cache: 'no-store',
        credentials: 'include',
      });
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks([]);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleSaved = () => {
    setModalOpen(false);
    setEditBook(null);
    loadBooks();
  };

  const openNew = () => {
    setEditBook(null);
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditBook(book);
    setModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Inventar</h1>
        <button className={styles.addButton} onClick={openNew}>＋</button>
      </header>

      <BookTable books={books} onEdit={openEdit} />

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setModalOpen(false)}>×</button>
            <h2>{editBook ? `Bearbeite: ${editBook.title}` : 'Neues Buch erfassen'}</h2>
            <BookForm bookToEdit={editBook ?? undefined} onSaved={handleSaved} />
          </div>
        </div>
      )}
    </div>
  );
}
