export type AuthSession = {
  isAuthenticated: boolean;
  email: string | null;
  loggedAt: string | null;
};

export const AUTH_STORAGE_KEY = "cargo-track-auth";

export const readAuthSession = (): AuthSession => {
  try {
    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) {
      return { isAuthenticated: false, email: null, loggedAt: null };
    }

    const parsed = JSON.parse(rawSession) as Partial<AuthSession>;
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      email: typeof parsed.email === "string" ? parsed.email : null,
      loggedAt: typeof parsed.loggedAt === "string" ? parsed.loggedAt : null,
    };
  } catch {
    return { isAuthenticated: false, email: null, loggedAt: null };
  }
};

export const writeAuthSession = (email: string) => {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      isAuthenticated: true,
      email,
      loggedAt: new Date().toISOString(),
    }),
  );
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
