export type User = {
    id: string;
    email: string;
    name: string | null;
    password?: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
};
