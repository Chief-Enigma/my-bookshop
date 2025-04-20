'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/useCart';
import styles from './CartButton.module.css';

export default function CartButton() {
  const router = useRouter();
  const { totalItems } = useCart();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      className={styles.fab}
      onClick={() => router.push('/dashboard/cart')}
    >
      🛒
      {mounted && totalItems > 0 && (
        <span className={styles.badge}>{totalItems}</span>
      )}
    </button>
  );
}
