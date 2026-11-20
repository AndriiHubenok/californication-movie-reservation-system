export interface User {
    username: string;
    isStaff: boolean;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (access: string, refresh: string, userData: User) => void;
    logout: () => void;
}