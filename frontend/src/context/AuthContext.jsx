import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { connectSocket, disconnectSocket } from '../socket';

const AuthContext = createContext();

function safeDecodeToken(token) {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return { id: payload.sub, name: payload.name, username: payload.username, email: payload.email };
  } catch {
    localStorage.removeItem('token');
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => safeDecodeToken(token), [token]);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      const decoded = safeDecodeToken(stored);
      if (decoded) {
        setToken(stored);
        connectSocket(stored);
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    connectSocket(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('pendingInvite');
    setToken(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
