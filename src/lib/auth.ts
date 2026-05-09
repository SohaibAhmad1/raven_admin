import type { User } from "./models";

export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_USER_KEY = "admin_user";

export function getStoredToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const rawUser = localStorage.getItem(ADMIN_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function setStoredSession(token: string, user: User): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

