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
import { setBirthDate } from '../utils/lifeWeeks';

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
        if (current) {
          const accountBirthday = current.user_metadata?.birthDate;
          const accountYear = current.user_metadata?.birthYear;
          if (accountBirthday) {
            setBirthDate(accountBirthday);
          } else if (accountYear) {
            localStorage.setItem('birthYear', String(accountYear));
            localStorage.setItem('birthDate', `${accountYear}-01-01`);
          }
        }
        setUser(current);
        setReady(true);
      }
    })();

    const unsubscribe = onAuthChange((_event, nextUser) => {
      if (nextUser) {
        const accountBirthday = nextUser.user_metadata?.birthDate;
        const accountYear = nextUser.user_metadata?.birthYear;
        if (accountBirthday) {
          setBirthDate(accountBirthday);
        } else if (accountYear) {
          localStorage.setItem('birthYear', String(accountYear));
          localStorage.setItem('birthDate', `${accountYear}-01-01`);
        }
      }
      setUser(nextUser ?? null);
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  // Clear local storage and cookies if not authenticated (when ready settles or user logs out)
  useEffect(() => {
    if (ready && !user) {
      // Clear localStorage entries
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('daily-') ||
            key.startsWith('weekly-') ||
            key === 'birthDate' ||
            key === 'birthYear' ||
            key === 'gotrue.user')
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear nf_jwt cookie
      document.cookie = 'nf_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }, [ready, user]);

  const login = useCallback(async (email, password) => {
    const u = await identityLogin(email, password);
    if (u) {
      const accountBirthday = u.user_metadata?.birthDate;
      const accountYear = u.user_metadata?.birthYear;
      if (accountBirthday) {
        setBirthDate(accountBirthday);
      } else if (accountYear) {
        localStorage.setItem('birthYear', String(accountYear));
        localStorage.setItem('birthDate', `${accountYear}-01-01`);
      }
    }
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
