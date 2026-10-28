

export interface User {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
}

export interface CreateUserDTO {
    username: string;
    email: string;
    password: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
}