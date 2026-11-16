import { apiRequest } from './apiClient';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface RegistrationTerms {
  version: string;
  content: string;
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'role' in value &&
    typeof value.role === 'string'
  );
}

export async function signUp(email: string, password: string, termsAccepted: boolean): Promise<AuthUser> {
  const response = await apiRequest<unknown>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, termsAccepted }),
  });
  if (!isAuthUser(response)) {
    throw new Error('Não foi possível carregar os dados da conta. Tente novamente.');
  }
  return { id: response.id, email: response.email, role: response.role };
}

export function getRegistrationTerms(): Promise<RegistrationTerms> {
  return apiRequest<unknown>('/auth/terms').then((response) => {
    if (
      typeof response !== 'object' ||
      response === null ||
      !('version' in response) ||
      typeof response.version !== 'string' ||
      !response.version ||
      !('content' in response) ||
      typeof response.content !== 'string' ||
      !response.content.trim()
    ) {
      throw new Error('Os termos de cadastro retornaram em formato inválido. Tente novamente.');
    }

    return { version: response.version, content: response.content };
  });
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<unknown>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!isAuthUser(response)) {
    throw new Error('Não foi possível carregar os dados da conta. Tente novamente.');
  }

  return { id: response.id, email: response.email, role: response.role };
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<unknown>('/auth/me');
  if (!isAuthUser(response)) {
    throw new Error('Não foi possível carregar os dados da conta. Tente novamente.');
  }
  return { id: response.id, email: response.email, role: response.role };
}

export async function signOut(): Promise<void> {
  await apiRequest<void>('/auth/signout', { method: 'POST' });
}
