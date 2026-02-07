import type { User } from "../types";

const SESSION_KEY = "kodingc_user";
const TOKENS_KEY = "kodingc_tokens";

export type StoredTokens = { accessToken: string; refreshToken: string };

export const setSession = (user: User, tokens?: StoredTokens) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  if (tokens) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }
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

export const getAccessToken = (): string | null => {
  const tokensStr = localStorage.getItem(TOKENS_KEY);
  if (!tokensStr) return null;
  try {
    const tokens = JSON.parse(tokensStr) as StoredTokens;
    return tokens.accessToken ?? null;
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  const tokensStr = localStorage.getItem(TOKENS_KEY);
  if (!tokensStr) return null;
  try {
    const tokens = JSON.parse(tokensStr) as StoredTokens;
    return tokens.refreshToken ?? null;
  } catch {
    return null;
  }
};

/** Update stored tokens only (e.g. after refresh). Does not modify user session. */
export const setTokens = (tokens: StoredTokens): void => {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKENS_KEY);
};
