"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  changePasswordFirstLogin,
  fetchCurrentUser,
  getAuthStorageKey,
  login,
  type AuthUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isTemporaryPassword: boolean;
  loading: boolean;
  loginUser: (identifier: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  completeFirstPasswordChange: (newPassword: string) => Promise<void>;
}

interface StoredAuth {
  token: string;
  user: AuthUser;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getAuthStorageKey());

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    window.localStorage.removeItem(getAuthStorageKey());
    return null;
  }
}

function writeStoredAuth(data: StoredAuth | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!data) {
    window.localStorage.removeItem(getAuthStorageKey());
    return;
  }

  window.localStorage.setItem(getAuthStorageKey(), JSON.stringify(data));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    writeStoredAuth(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    const me = await fetchCurrentUser(token);
    setUser(me);
    writeStoredAuth({ token, user: me });
  }, [token]);

  const loginUser = useCallback(async (identifier: string, password: string) => {
    const result = await login(identifier, password);

    // Tras el login exitoso, obtenemos el perfil completo (con relaciones)
    // para evitar datos parciales en la UI.
    const me = await fetchCurrentUser(result.jwt);

    setToken(result.jwt);
    setUser(me);
    writeStoredAuth({ token: result.jwt, user: me });
  }, []);

  const completeFirstPasswordChange = useCallback(
    async (newPassword: string) => {
      if (!token) {
        throw new Error("No hay sesion activa.");
      }

      await changePasswordFirstLogin(token, newPassword);
      await refreshUser();
    },
    [refreshUser, token]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const stored = readStoredAuth();

      if (!stored) {
        setLoading(false);
        return;
      }

      setToken(stored.token);
      setUser(stored.user);

      try {
        const me = await fetchCurrentUser(stored.token);
        setUser(me);
        writeStoredAuth({ token: stored.token, user: me });
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    void initializeAuth();
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isTemporaryPassword: Boolean(user?.password_temporal),
      loading,
      loginUser,
      refreshUser,
      logout,
      completeFirstPasswordChange,
    }),
    [completeFirstPasswordChange, loading, loginUser, logout, refreshUser, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
