import { Book } from './Book';

export interface OrderItem {
    bookId: string;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    orderDate: string;      // ISO
    status: 'pending' | 'completed' | 'cancelled';
}
