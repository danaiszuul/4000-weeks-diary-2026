import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getUser,
  login as identityLogin,
  signup as identitySignup,
  logout as identityLogout,
  handleAuthCallback,
  onAuthChange,
  updateUser,
} from '@netlify/identity';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // Process confirmation / recovery / OAuth redirects landing in the URL hash.
        await handleAuthCallback();
      } catch {
        // A malformed callback shouldn't block the app from loading.
      }
      const current = await getUser();
      if (active) {
        setUser(current);
        setReady(true);
      }
    })();

    const unsubscribe = onAuthChange((_event, nextUser) => {
      setUser(nextUser ?? null);
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await identityLogin(email, password);
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (email, password, name, birthday) => {
    // Birthday is captured at sign-up and stored in the account so the
    // life-week math follows the user across devices.
    const metadata = {};
    if (name) metadata.full_name = name;
    if (birthday) {
      metadata.birthDate = birthday;
      metadata.birthYear = parseInt(birthday.slice(0, 4), 10);
    }
    return identitySignup(
      email,
      password,
      Object.keys(metadata).length ? metadata : undefined,
    );
  }, []);

  const logout = useCallback(async () => {
    await identityLogout();
    setUser(null);
  }, []);

  // Birthday travels with the account so it follows the user across devices.
  const saveBirthday = useCallback(
    async (birthday) => {
      if (!user) return;
      const updated = await updateUser({
        data: {
          birthDate: birthday,
          birthYear: parseInt(birthday.slice(0, 4), 10),
        },
      });
      setUser(updated);
    },
    [user],
  );

  const value = {
    user,
    ready,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    saveBirthday,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
