'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './BookForm.module.css';
import type { Book, Genre } from '@/models/Book';

const GENRES: Genre[] = [
  'Fiction','Non‑Fiction','Sci‑Fi','Fantasy','Biography','Children','Other'
];

interface Props {
  bookToEdit?: Book;
  onSaved: () => void;
}

export default function BookForm({ bookToEdit, onSaved }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<Book, 'id'|'createdAt'|'ownerId'>>({
    title: '',
    author: '',
    price: 0,
    genre: 'Fiction',
    pageCount: 0,
    stock: 0,
    imageUrl: '', 
  });

  useEffect(() => {
    if (bookToEdit) {
      const { id, createdAt, ownerId, ...rest } = bookToEdit;
      setForm(rest);
    }
  }, [bookToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = bookToEdit ? 'PATCH' : 'POST';
    const payload = bookToEdit
      ? { id: bookToEdit.id, ...form }
      : form;

    const res = await fetch('/api/books', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (res.ok) {
      setForm({ title: '', author: '', price: 0, genre: 'Fiction', pageCount: 0, stock: 0, imageUrl: '' });
      onSaved();
      router.refresh();
    } else {
      const err = await res.json();
      alert('Fehler: ' + err.error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="title">Titel</label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="author">Autor</label>
        <input
          id="author"
          type="text"
          value={form.author}
          onChange={e => setForm({ ...form, author: e.target.value })}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="price">Preis (CHF)</label>
        <input
          id="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="genre">Genre</label>
        <select
          id="genre"
          value={form.genre}
          onChange={e => setForm({ ...form, genre: e.target.value as Genre })}
        >
          {GENRES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="pageCount">Seitenzahl</label>
        <input
          id="pageCount"
          type="number"
          value={form.pageCount}
          onChange={e => setForm({ ...form, pageCount: parseInt(e.target.value) })}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="stock">Bestand</label>
        <input
          id="stock"
          type="number"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })}
        />
      </div>

      <input type="hidden" value={form.imageUrl} />

      <button type="submit" className={styles.submitButton}>
        {bookToEdit ? 'Änderungen speichern' : 'Neues Buch anlegen'}
      </button>
    </form>
  );
}
