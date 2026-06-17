export type UserRole = 'SUPER_ADMIN' | 'FARM_MANAGER' | 'VETERINARIAN' | 'WORKER' | 'ACCOUNTANT';

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: UserRole;
    role_display?: string;
    phone: string;
    avatar: string | null;
    is_active?: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    date_joined?: string;
    last_login?: string | null;
}

export interface AuthResponse {
    token: string;
}

export interface Farm {
    id: string;
    name: string;
}

// Add more types as we implement features
