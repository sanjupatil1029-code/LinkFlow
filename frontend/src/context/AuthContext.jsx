import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/services';
import { clearToken, getToken, setToken, UNAUTHORIZED_EVENT } from '../api/client';

const AuthContext = createContext(null);

/** status: 'loading' | 'authed' | 'anon' | 'error' */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(getToken() ? 'loading' : 'anon');
  const [bootError, setBootError] = useState(null);

  const restore = useCallback(async () => {
    if (!getToken()) {
      setStatus('anon');
      return;
    }
    setStatus('loading');
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus('authed');
    } catch (err) {
      if (err.response?.status === 401) {
        clearToken();
        setUser(null);
        setStatus('anon');
      } else {
        // Backend unreachable: keep the token so the session survives a restart.
        setBootError(err);
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
  const handlePageShow = (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  };

  window.addEventListener('pageshow', handlePageShow);

  return () => {
    window.removeEventListener('pageshow', handlePageShow);
  };
}, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setStatus('anon');
      toast.error('Your session expired. Please sign in again.');
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const token = await authApi.login({ email, password });
    setToken(token);
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus('authed');
    } catch (err) {
      clearToken();
      throw err;
    }
  }, []);

  const register = useCallback(
    async ({ username, email, password }) => {
      await authApi.register({ username, email, password });
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus('anon');
    toast.success('Signed out');
  }, []);

  const value = useMemo(
    () => ({ user, status, bootError, isAuthenticated: status === 'authed', login, register, logout, retry: restore }),
    [user, status, bootError, login, register, logout, restore]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function displayName(user) {
  return user?.username || user?.name || user?.full_name || user?.email?.split('@')[0] || 'there';
}
