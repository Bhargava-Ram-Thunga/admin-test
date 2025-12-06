import type { User } from "../types";

const SESSION_KEY = "kodingc_user";

export const setSession = (user: User) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const getSession = (): User | null => {
  const userStr = localStorage.getItem(SESSION_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch (e) {
    console.error("Failed to parse user session", e);
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};
