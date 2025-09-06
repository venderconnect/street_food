import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const login = (t, r, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('role', r);
    localStorage.setItem('userId', u);
    setToken(t); setRole(r); setUserId(u);
  };

  const logout = () => {
    ['token','role','userId'].forEach(k => localStorage.removeItem(k));
    setToken(null); setRole(null); setUserId(null);
  };

  const value = useMemo(() => ({ token, role, userId, login, logout }), [token, role, userId]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
