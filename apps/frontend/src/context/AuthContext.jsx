import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const fetchWithFallback = async (endpoint, options = {}) => {
  try {
    const res = await fetch(endpoint, options);
    return res;
  } catch (err) {
    const directUrl = `http://127.0.0.1:8000${endpoint}`;
    return await fetch(directUrl, options);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synova_user');
    return saved ? JSON.parse(saved) : { id: 1, email: 'demo@example.com', full_name: 'Arvinth Kumar', role: 'customer' };
  });
  const [token, setToken] = useState(() => localStorage.getItem('synova_token') || 'demo-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && token !== 'demo-token') {
      fetchWithFallback('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setUser(data);
            localStorage.setItem('synova_user', JSON.stringify(data));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetchWithFallback('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      const userObj = data.user || { id: Date.now(), email, full_name: email.split('@')[0], role: 'customer' };
      setToken(data.access_token || 'session-token');
      setUser(userObj);
      localStorage.setItem('synova_token', data.access_token || 'session-token');
      localStorage.setItem('synova_user', JSON.stringify(userObj));

      // Append to user directory for admin view
      try {
        const directory = JSON.parse(localStorage.getItem('synova_registered_users') || '[]');
        const filtered = directory.filter(u => u.email !== userObj.email);
        localStorage.setItem('synova_registered_users', JSON.stringify([...filtered, { ...userObj, is_active: true, created_at: new Date().toISOString() }]));
      } catch (e) {}

      return { success: true, user: userObj };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, full_name) => {
    setLoading(true);
    try {
      const res = await fetchWithFallback('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      // Record to user directory
      try {
        const directory = JSON.parse(localStorage.getItem('synova_registered_users') || '[]');
        const newUser = {
          id: data.id || Date.now(),
          email,
          full_name: full_name || email.split('@')[0],
          role: 'customer',
          is_active: true,
          created_at: new Date().toISOString()
        };
        const filtered = directory.filter(u => u.email !== email);
        localStorage.setItem('synova_registered_users', JSON.stringify([...filtered, newUser]));
      } catch (e) {}

      return await login(email, password);
    } catch (err) {
      // Local fallback for demo environments
      const localUser = {
        id: Date.now(),
        email,
        full_name: full_name || email.split('@')[0],
        role: 'customer',
        is_active: true,
        created_at: new Date().toISOString()
      };
      try {
        const directory = JSON.parse(localStorage.getItem('synova_registered_users') || '[]');
        const filtered = directory.filter(u => u.email !== email);
        localStorage.setItem('synova_registered_users', JSON.stringify([...filtered, localUser]));
      } catch (e) {}
      setUser(localUser);
      setToken('demo-token');
      localStorage.setItem('synova_user', JSON.stringify(localUser));
      return { success: true, user: localUser };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('synova_token');
    localStorage.removeItem('synova_user');
  };

  const loginDemo = (role = 'customer') => {
    const demo = role === 'admin' 
      ? { id: 2, email: 'admin@example.com', full_name: 'Platform Admin', role: 'admin' }
      : { id: 1, email: 'demo@example.com', full_name: 'Arvinth Kumar', role: 'customer' };
    setUser(demo);
    setToken('demo-token');
    localStorage.setItem('synova_user', JSON.stringify(demo));
    localStorage.setItem('synova_token', 'demo-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
