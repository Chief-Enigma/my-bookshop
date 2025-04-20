import { notFound } from 'next/navigation';
import BookController from '@/controllers/BookController';
import BookDetailClient from './BookDetailClient';
import styles from './page.module.css';

interface PageProps {
  params: { id: string };
}

export default async function BookDetailPage({ params }: PageProps) {
  const book = BookController.listAll().find(b => b.id === params.id);
  if (!book) notFound();

  return (
    <div className={styles.wrapper}>
      <BookDetailClient book={book} />
    </div>
  );
}
