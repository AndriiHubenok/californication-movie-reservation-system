export interface User {
    email: string;
    username: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (access: string, refresh: string, userData: User) => void;
    logout: () => void;
}