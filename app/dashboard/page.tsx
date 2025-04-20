// app/dashboard/page.tsx
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'admin';
}

export default async function DashboardHome() {
  const hdrs = headers();
  const cookieHeader = (await hdrs).get('cookie') ?? '';

  const host = (await hdrs).get('host');
  if (!host) redirect('/login');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  const res = await fetch(`${origin}/api/auth`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });

  if (!res.ok) redirect('/login');
  const { user } = (await res.json()) as { user: User | null };
  if (!user) redirect('/login');

  const { email, role } = user;
  const isAdmin = role === 'admin';

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Willkommen zurück, {email}</h1>
        <p className={styles.subtitle}>
          Schön, dich im Bookshop Dashboard zu sehen!
        </p>
      </section>

      <section className={styles.cards}>
        <Link href="/dashboard/shop" className={styles.card}>
          <div className={styles.cardIcon}>📚</div>
          <h3 className={styles.cardTitle}>Shop</h3>
          <p className={styles.cardText}>Hier kannst du Bücher durchstöbern.</p>
        </Link>

        <Link href="/dashboard/orders" className={styles.card}>
          <div className={styles.cardIcon}>🛒</div>
          <h3 className={styles.cardTitle}>Bestellungen</h3>
          <p className={styles.cardText}>Deine bisherigen Einkäufe.</p>
        </Link>

        {isAdmin && (
          <Link href="/dashboard/inventory" className={styles.card}>
            <div className={styles.cardIcon}>📦</div>
            <h3 className={styles.cardTitle}>Inventory</h3>
            <p className={styles.cardText}>Verwalte deine Bücher.</p>
          </Link>
        )}
      </section>
    </div>
  );
}
