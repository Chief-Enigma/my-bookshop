'use client';

import Link from 'next/link';
import React from 'react';
import type { Book } from '@/models/Book';
import styles from './BookCard.module.css';

interface Props {
    book: Book;
}

export default function BookCard({ book }: Props) {
    return (
        <Link href={`/dashboard/shop/${book.id}`} className={styles.cardLink}>
            <div className={styles.card}>
                <div className={styles.cover}>
                    {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} />
                    ) : (
                        <div className={styles.placeholder}>No Image</div>
                    )}
                </div>
                <div className={styles.info}>
                    <h3 className={styles.title}>{book.title}</h3>
                    <p className={styles.author}>{book.author}</p>
                    <p className={styles.genre}>{book.genre}</p>
                    <p className={styles.pages}>{book.pageCount} Seiten</p>
                    <p className={styles.price}>{book.price.toFixed(2)} CHF</p>
                </div>
            </div>
        </Link>
    );
}
