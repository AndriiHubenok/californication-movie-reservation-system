import {apiClient} from "./client.ts";

interface LoginRequest {
    username: string;
    password: string;
}

interface LoginResponse {
    access: string;
    refresh: string;
}

export async function loginRequest({ username, password }: LoginRequest) {
    return apiClient<LoginResponse>('/api/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}