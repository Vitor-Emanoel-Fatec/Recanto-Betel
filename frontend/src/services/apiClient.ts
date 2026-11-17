export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly validationIssues: Array<{ field: string; message: string }> = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 15_000;

function normalizeServerMessage(message: string): string {
  const normalized = message.trim().toLowerCase();
  if (normalized === 'unauthorized' || normalized === 'forbidden') {
    return 'Você não possui autorização para realizar esta ação.';
  }
  if (normalized === 'not found' || normalized.includes('validation failed (uuid')) {
    return 'O registro solicitado não foi encontrado.';
  }
  if (normalized === 'bad request' || normalized.startsWith('validation failed')) {
    return 'Verifique os dados informados e tente novamente.';
  }
  if (
    message.trim().startsWith('<') ||
    /\b(internal server error|request failed|must be|must not|should not|is required|endpoint|backend)\b/i
      .test(message)
  ) {
    return 'Não foi possível concluir a solicitação. Tente novamente.';
  }
  return message;
}

function getErrorMessage(payload: unknown): string {
  if (typeof payload === 'string' && payload.trim()) return normalizeServerMessage(payload);

  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const message = payload.message;
    if (typeof message === 'string') return normalizeServerMessage(message);
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.map(normalizeServerMessage).join(' ');
    }
  }

  return 'Não foi possível concluir a solicitação. Tente novamente.';
}

function getValidationIssues(payload: unknown): Array<{ field: string; message: string }> {
  if (typeof payload !== 'object' || payload === null || !('fields' in payload) || !('message' in payload)) {
    return [];
  }
  const fields = payload.fields;
  const messages = payload.message;
  if (!Array.isArray(fields) || !Array.isArray(messages)) return [];

  return fields.flatMap((field, index) =>
    typeof field === 'string' && typeof messages[index] === 'string'
      ? [{ field, message: messages[index] }]
      : [],
  );
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = init.signal
    ? undefined
    : window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: init.credentials ?? 'include',
      headers,
      signal: init.signal ?? controller.signal,
    });
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
      throw new ApiError(getErrorMessage(payload), response.status, getValidationIssues(payload));
    }

    if (responseText && typeof payload === 'string') {
      throw new ApiError('Não foi possível processar a resposta. Tente novamente.', response.status);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new ApiError('A solicitação expirou. Tente novamente.');
    }
    throw new ApiError('Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.');
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}
