import {apiClient} from "./client.ts";
import type {User} from "../types/auth.ts";

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

export interface VerifyEmailPayload {
    uid: string;
    token: string;
}

export interface MessageResponse {
    detail?: string;
    message?: string;
}

interface GetOwnUserInfoResponse {
    username: string;
    is_staff: boolean;
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

export async function verifyEmailRequest(payload: VerifyEmailPayload): Promise<MessageResponse> {
    return apiClient<MessageResponse>('/api/verify/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function resendVerificationRequest(email: string): Promise<MessageResponse> {
    return apiClient<MessageResponse>('/api/verify/resend/', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function getOwnUserInfo(): Promise<GetOwnUserInfoResponse> {
    return apiClient<GetOwnUserInfoResponse>('/api/me/', {
        method: 'GET',
    });
}