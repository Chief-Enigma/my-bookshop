'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/useCart';
import { useRouter } from 'next/navigation';
import type { Book } from '@/models/Book';
import styles from './cart.module.css';

type Step = 1 | 2 | 3;

export default function CartPage() {
  const { cart, updateQty, removeItem, clear } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [step, setStep] = useState<Step>(1);
  const [payment, setPayment] = useState<'ghost' | 'cash'>('ghost');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/books', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setBooks(Array.isArray(data) ? data : []);
        setBooksLoaded(true);
      });
  }, []);

  const items = cart
    .map(ci => {
      const book = books.find(b => b.id === ci.bookId);
      return book ? { ...ci, book } : null;
    })
    .filter((i): i is { bookId: string; quantity: number; book: Book } => i !== null);

  if (!booksLoaded) {
    return <p className={styles.empty}>Lade Warenkorb …</p>;
  }

  const total = items.reduce((sum, i) => sum + i.book.price * i.quantity, 0);

  const handleCheckout = async () => {
    setLoadingOrder(true);
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({ bookId: i.bookId, quantity: i.quantity })),
        paymentMethod: payment,
      }),
      credentials: 'include',
    });
    clear();
    setStep(3);
    setLoadingOrder(false);
  };

  return (
    <div className={styles.container}>
      <ul className={styles.progress}>
        <li className={step >= 1 ? styles.active : ''}>Warenkorb</li>
        <li className={step >= 2 ? styles.active : ''}>Zahlung</li>
        <li className={step >= 3 ? styles.active : ''}>Bestätigung</li>
      </ul>

      {step === 1 && (
        <>
          <h1 className={styles.title}>Warenkorb</h1>
          {items.length === 0 ? (
            <p className={styles.empty}>Dein Warenkorb ist leer.</p>
          ) : (
            <>
              <ul className={styles.list}>
                {items.map(i => (
                  <li key={i.bookId} className={styles.item}>
                    <span>{i.book.title}</span>
                    <div className={styles.quantityControl}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => updateQty(i.bookId, i.quantity - 1)}
                        disabled={i.quantity <= 1}
                      >
                        –
                      </button>
                      <input
                        type="text"
                        readOnly
                        className={styles.quantityInput}
                        value={i.quantity}
                      />
                      <button
                        className={styles.quantityBtn}
                        onClick={() => updateQty(i.bookId, i.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeItem(i.bookId)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <p className={styles.total}>Gesamt: {total.toFixed(2)} CHF</p>
              <button
                className={styles.next}
                onClick={() => setStep(2)}
              >
                Weiter zur Zahlung
              </button>
            </>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <h1 className={styles.title}>Zahlungsart</h1>
          <div className={styles.paymentOptions}>
            <label className={styles.paymentOption}>
              <input
                type="radio"
                className={styles.radioInput}
                checked={payment === 'ghost'}
                onChange={() => setPayment('ghost')}
              />
              <span className={styles.paymentIcon}>👻</span> Pay with Ghost Money
            </label>
            <label className={styles.paymentOption}>
              <input
                type="radio"
                className={styles.radioInput}
                checked={payment === 'cash'}
                onChange={() => setPayment('cash')}
              />
              <span className={styles.paymentIcon}>💵</span> Cash on Delivery
            </label>
          </div>
          <button
            className={loadingOrder ? styles.nextDisabled : styles.next}
            onClick={handleCheckout}
            disabled={loadingOrder}
          >
            {loadingOrder ? 'Bitte warten…' : 'Jetzt bezahlen'}
          </button>
        </>
      )}
      
      {step === 3 && (
        <div className={styles.confirm}>
          <h1 className={styles.title}>Vielen Dank!</h1>
          <p className={styles.confirmMessage}>
            Deine Bestellung wurde erfolgreich aufgegeben.
          </p>
          <button
            className={styles.next}
            onClick={() => router.push('/dashboard/shop')}
          >
            Neue Bestellung starten
          </button>
        </div>
      )}
    </div>
  );
}
