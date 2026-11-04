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
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, headers, ...restOptions } = options;

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