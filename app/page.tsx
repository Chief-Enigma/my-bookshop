import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Willkommen im Bookshop</h1>
        <p className={styles.subtitle}>
          Entdecke, bestelle und verwalte deine Bücher an einem Ort.
        </p>
        <div className={styles.actions}>
          <Link href="/login" className={styles.buttonPrimary}>
            Anmelden
          </Link>
          <Link href="/login" className={styles.buttonSecondary}>
            Registrieren
          </Link>
        </div>
      </header>

      <section className={styles.features}>
        <div className={styles.card}>
          <div className={styles.icon}>📚</div>
          <h3 className={styles.cardTitle}>Große Auswahl</h3>
          <p className={styles.cardText}>
            Durchstöbere hunderte Titel aus allen Genres.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}>🛒</div>
          <h3 className={styles.cardTitle}>Einfach Bestellen</h3>
          <p className={styles.cardText}>
            Lege deine Lieblingsbücher mit einem Klick in den Warenkorb.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}>🔧</div>
          <h3 className={styles.cardTitle}>Admin‑Tools</h3>
          <p className={styles.cardText}>
            Verwalte dein Inventory und behalte Bestellungen im Blick.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Bookshop. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}
