import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

/* Parse JWT token payload */
const parseToken = (token) => {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/* Check if token is expired */
const isTokenExpired = (payload) => {
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      const payload = parseToken(stored);

      // Check expiration
      if (isTokenExpired(payload)) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } else {
        setToken(stored);
        setUser({
          id: payload.sub || payload.id,
          email: payload.email,
          username: payload.username,
          name: payload.name,
        });
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    const payload = parseToken(newToken);

    setToken(newToken);
    setUser({
      id: payload.sub || payload.id,
      email: payload.email,
      username: payload.username,
      name: payload.name,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);