import { getClientApiBaseUrl } from '@repo/api-config/urls';
import { handleMockApi } from './mock-api';

const API_BASE_URL = getClientApiBaseUrl();
const USE_MOCK_FALLBACK = true;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error || 'Something went wrong', response.status, data.code);
  }
  return data as T;
}

function authHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: authHeaders(token),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return await parseResponse<T>(response);
  } catch (error) {
    if (USE_MOCK_FALLBACK) {
      console.warn(`[Admin Mock Fallback] Failed to reach ${path}, using mock data.`, error);
      return handleMockApi('POST', path, body) as Promise<T>;
    }
    throw new ApiError('Unable to reach the server', 0);
  }
}

export async function apiPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return await parseResponse<T>(response);
  } catch (error) {
    if (USE_MOCK_FALLBACK) {
      console.warn(`[Admin Mock Fallback] Failed to reach ${path}, using mock data.`, error);
      return handleMockApi('PATCH', path, body) as Promise<T>;
    }
    throw new ApiError('Unable to reach the server', 0);
  }
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: authHeaders(token),
      credentials: 'include',
    });
    return await parseResponse<T>(response);
  } catch (error) {
    if (USE_MOCK_FALLBACK) {
      console.warn(`[Admin Mock Fallback] Failed to reach ${path}, using mock data.`, error);
      return handleMockApi('GET', path) as Promise<T>;
    }
    throw new ApiError('Unable to reach the server', 0);
  }
}

export async function apiDelete<T>(path: string, token?: string | null): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: authHeaders(token),
      credentials: 'include',
    });
    return await parseResponse<T>(response);
  } catch (error) {
    if (USE_MOCK_FALLBACK) {
      console.warn(`[Admin Mock Fallback] Failed to reach ${path}, using mock data.`, error);
      return handleMockApi('DELETE', path) as Promise<T>;
    }
    throw new ApiError('Unable to reach the server', 0);
  }
}

export { API_BASE_URL };
