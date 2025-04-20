export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'customer' | 'admin';
    createdAt: string;      // ISO
}
