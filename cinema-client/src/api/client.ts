

export class ApiError extends Error {
    public status: number;
    public data: unknown;

    constructor(status: number, message: string, data: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

interface RequestOptions extends RequestInit {
    token?: string | null;
    _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) {
        return refreshPromise;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        return null;
    }

    refreshPromise = (async () => {
        try {
            const response = await fetch('/api/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!response.ok) {
                return null;
            }

            const data = (await response.json()) as { access: string; refresh?: string };
            localStorage.setItem('accessToken', data.access);
            if (data.refresh) {
                localStorage.setItem('refreshToken', data.refresh);
            }
            return data.access;
        } catch {
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, headers, _retry = false, ...restOptions } = options;

    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((headers as Record<string, string>) || {}),
    };

    const activeToken = token ?? localStorage.getItem('accessToken');
    if (activeToken) {
        requestHeaders['Authorization'] = `Bearer ${activeToken}`;
    }

    const response = await fetch(endpoint, {
        headers: requestHeaders,
        ...restOptions,
    });

    const isAuthEndpoint = endpoint.includes('/api/token/');

    if (response.status === 401 && !_retry && !isAuthEndpoint) {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
            return apiClient<T>(endpoint, {
                ...options,
                token: newAccessToken,
                _retry: true,
            });
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
        throw new ApiError(401, 'Session expired. Please log in again.', null);
    }

    if (response.status === 204) {
        return {} as T;
    }

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        if (responseData && typeof responseData === 'object') {
            errorMessage = Object.entries(responseData)
                .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
                .join('; ');
        }
        throw new ApiError(response.status, errorMessage, responseData);
    }

    return responseData as T;
}