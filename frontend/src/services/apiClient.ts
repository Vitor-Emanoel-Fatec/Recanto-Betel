export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 15_000;

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === 'string' && payload.trim()) return payload;

  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const message = payload.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join(' ');
    }
  }

  return `A API retornou um erro (${status}).`;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  const controller = new AbortController();
  const timeoutId = init.signal
    ? undefined
    : window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: init.credentials ?? 'include',
      headers,
      signal: init.signal ?? controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError('A solicitação expirou. Tente novamente.');
    }
    throw new ApiError('Não foi possível conectar à API. Verifique se o serviço está disponível.');
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }

  if (response.status === 204) return undefined as T;

  const responseText = await response.text();
  let payload: unknown = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText) as unknown;
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status);
  }

  if (responseText && typeof payload === 'string') {
    throw new ApiError('A API retornou uma resposta em formato inesperado.', response.status);
  }

  return payload as T;
}
