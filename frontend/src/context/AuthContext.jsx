import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { tokens, cachedUser } from "../lib/tokens";
import { me as fetchMe, login as apiLogin, register as apiRegister } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => cachedUser.get());
  const [bootstrapping, setBootstrapping] = useState(true);

  // On mount, if we have a token, validate it by hitting /users/me.
  // This makes sure stale tokens don't keep us "logged in".
  useEffect(() => {
    let cancelled = false;
    const token = tokens.get();
    if (!token) {
      setBootstrapping(false);
      return;
    }
    fetchMe()
      .then((u) => {
        if (cancelled) return;
        const normalized = { id: u._id || u.id, name: u.name, email: u.email, role: u.role };
        cachedUser.set(normalized);
        setUser(normalized);
      })
      .catch(() => {
        if (cancelled) return;
        tokens.clear();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    tokens.set(data.access_token);
    cachedUser.set(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    await apiRegister(payload);
    // Auto-login after register
    return login(payload.email, payload.password);
  }, [login]);

  const logout = useCallback(() => {
    tokens.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, bootstrapping, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
