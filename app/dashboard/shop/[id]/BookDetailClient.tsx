'use client';

import { useEffect, useState } from 'react';
import type { Book } from '@/models/Book';
import { useCart } from '@/lib/useCart';
import styles from './page.module.css';
import CartButton from '../Components/CartButton';

interface Props {
  book: Book;
}

export default function BookDetailClient({ book }: Props) {
  const { addItem, totalItems } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(book.id, 1);
    setAdded(true);
  };

  useEffect(() => {
    if (added) {
      const t = setTimeout(() => setAdded(false), 3000);
      return () => clearTimeout(t);
    }
  }, [added]);

  return (
    <div className={styles.detailContainer}>
      <div className={styles.imageSection}>
        {book.imageUrl ? (
          <img src={book.imageUrl} alt={book.title} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>Kein Bild verfügbar</div>
        )}
      </div>
      <div className={styles.infoSection}>
        <h1 className={styles.title}>{book.title}</h1>
        <p className={styles.author}>von {book.author}</p>
        <div className={styles.meta}>
          <span className={styles.genre}>{book.genre}</span>
          <span className={styles.pages}>{book.pageCount} Seiten</span>
        </div>
        <p className={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vehicula
          urna et elit consequat, nec pellentesque metus convallis.
        </p>
        <div className={styles.purchase}>
          <span className={styles.price}>{book.price.toFixed(2)} CHF</span>
          {book.stock > 0 ? (
            <button
              className={styles.buyButton}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? 'Hinzugefügt!' : 'In den Warenkorb'}
            </button>
          ) : (
            <span className={styles.soldOut}>Ausverkauft</span>
          )}
        </div>
        {added && (
          <div className={styles.toast}>
            📦 „{book.title}“ wurde zum Warenkorb hinzugefügt.
          </div>
        )}
        <div className={styles.stockInfo}>
          <p>Auf Lager: <strong>{book.stock}</strong></p>
          <p>Erstellt am: <em>{new Date(book.createdAt).toLocaleDateString()}</em></p>
        </div>
      </div>
      <CartButton />
    </div>
  );
}
