// app/dashboard/layout.tsx
import { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import styles from './layout.module.css';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  
  const cookieHeader = (await headers()).get('cookie') ?? '';

  const host = (await headers()).get('host');
  if (!host) redirect('/login');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  const res = await fetch(`${origin}/api/auth`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
  if (!res.ok) {
    redirect('/login');
  }
  const { user } = (await res.json()) as { user: { id: string; email: string; role: 'customer' | 'admin' } | null };

  if (!user) {
    redirect('/login');
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          <ul>
            <li><a href="/dashboard">Übersicht</a></li>
            <li><a href="/dashboard/shop">Shop</a></li>
            <li><a href="/dashboard/orders">Bestellungen</a></li>
            {isAdmin && <li><a href="/dashboard/inventory">Inventar</a></li>}
            <li><a href="/login?action=logout">Logout</a></li>
          </ul>
        </nav>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
