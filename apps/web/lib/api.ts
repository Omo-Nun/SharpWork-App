const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Something went wrong',
      response.status,
      data.code,
      data
    );
  }

  return data as T;
}

function authHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: init?.method || 'POST',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      credentials: 'include',
      body: JSON.stringify(body),
      ...init,
    });
  } catch {
    throw new ApiError('Unable to reach the server', 0);
  }

  return parseResponse<T>(response);
}

export async function apiPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    credentials: 'include',
    body: JSON.stringify(body),
  });

  return parseResponse<T>(response);
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: authHeaders(token),
      credentials: 'include',
    });
  } catch {
    throw new ApiError('Unable to reach the server', 0);
  }

  return parseResponse<T>(response);
}

export async function apiDelete<T>(path: string, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(token),
    credentials: 'include',
  });

  return parseResponse<T>(response);
}

export async function refreshAccessToken(): Promise<string> {
  const result = await apiPost<{ accessToken: string }>('/auth/refresh', {});
  return result.accessToken;
}

export { API_BASE_URL };
