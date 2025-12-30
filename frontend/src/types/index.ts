export interface User {
    id: number;
    email: string;
    full_name: string;
    role: 'SUPER_ADMIN' | 'FARM_MANAGER' | 'VETERINARIAN' | 'WORKER' | 'ACCOUNTANT';
    phone: string;
    avatar: string | null;
}

export interface AuthResponse {
    token: string;
}

export interface Farm {
    id: string;
    name: string;
}

// Add more types as we implement features
