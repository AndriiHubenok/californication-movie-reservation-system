import {apiClient} from "./client.ts";

interface LoginRequest {
    username: string;
    password: string;
}

interface LoginResponse {
    access: string;
    refresh: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    id: number;
    username: string;
    email: string;
}

export async function loginRequest({ username, password }: LoginRequest) {
    return apiClient<LoginResponse>('/api/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

export async function registerRequest(payload: RegisterPayload): Promise<RegisterResponse> {
    return apiClient<RegisterResponse>('/api/register/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}