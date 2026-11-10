import { apiRequest } from './apiClient';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
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

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<unknown>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!isAuthUser(response)) {
    throw new Error('A API retornou dados de usuário incompletos.');
  }
  return { id: response.id, email: response.email, role: response.role };
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<unknown>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!isAuthUser(response)) {
    throw new Error('A API retornou dados de usuário incompletos.');
  }

  return { id: response.id, email: response.email, role: response.role };
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<unknown>('/auth/me');
  if (!isAuthUser(response)) {
    throw new Error('A API retornou dados de usuário incompletos.');
  }
  return { id: response.id, email: response.email, role: response.role };
}

export async function signOut(): Promise<void> {
  await apiRequest<void>('/auth/signout', { method: 'POST' });
}
