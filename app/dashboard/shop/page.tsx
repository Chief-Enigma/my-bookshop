
'use client';

import React, { useState, useEffect } from 'react';
import type { Book, Genre } from '@/models/Book';
import BookCard from './Components/BookCard';
import styles from './shop.module.css';
import CartButton from './Components/CartButton';

export default function ShopPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filtered, setFiltered] = useState<Book[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
  const [genreFilter, setGenreFilter] = useState<Genre | ''>('');
  const [minPages, setMinPages] = useState(0);
  const [maxPages, setMaxPages] = useState(1000);

  useEffect(() => {
    fetch('/api/books', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setBooks(data) : setBooks([]));
  }, []);

  useEffect(() => {
    let list = [...books];

    if (genreFilter) {
      list = list.filter(b => b.genre === genreFilter);
    }

    list = list.filter(b => b.pageCount >= minPages && b.pageCount <= maxPages);

    if (sortOrder === 'asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      list.sort((a, b) => b.price - a.price);
    }

    setFiltered(list);
  }, [books, sortOrder, genreFilter, minPages, maxPages]);

  const genres = Array.from(new Set(books.map(b => b.genre)));

  return (
    <div className={styles.container}>
      <h1>Shop</h1>

      <div className={styles.filters}>
        <div className={styles.filter}>
          <label>Sortiere Preis:</label>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)}>
            <option value="">Kein</option>
            <option value="asc">Aufsteigend</option>
            <option value="desc">Absteigend</option>
          </select>
        </div>

        <div className={styles.filter}>
          <label>Genre:</label>
          <select value={genreFilter} onChange={e => setGenreFilter(e.target.value as any)}>
            <option value="">Alle</option>
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className={styles.filter}>
          <label>Seitenzahl:</label>
          <input
            type="number"
            value={minPages}
            onChange={e => setMinPages(parseInt(e.target.value) || 0)}
            placeholder="Min"
          />
          <span>–</span>
          <input
            type="number"
            value={maxPages}
            onChange={e => setMaxPages(parseInt(e.target.value))}
            placeholder="Max"
          />
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map(b => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>

      <CartButton />
    </div>
  );
}
