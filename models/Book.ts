// models/Book.ts
export type Genre =
    | 'Fiction'
    | 'Non‑Fiction'
    | 'Sci‑Fi'
    | 'Fantasy'
    | 'Biography'
    | 'Children'
    | 'Other';

export interface Book {
    id: string;
    title: string;
    author: string;
    price: number;
    genre: Genre;
    pageCount: number;
    stock: number;
    imageUrl: string;
    ownerId: string;
    createdAt: string;
}
