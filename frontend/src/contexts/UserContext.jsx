import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const apiOrigin = import.meta.env.VITE_API_ORIGIN;

  // Check login status on mount
  useEffect(() => {
    fetch(`${apiOrigin}/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data.username ? { username: data.username } : null));
  }, []);

  // Login action
  const login = async (username, password) => {

    // Call to the login API endpoint
    const res = await fetch(`${apiOrigin}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    // If successful then set the returned username
    if (res.ok) {
      setUser({ username });
      return true;
    } else {
      // If not successful then render error msg
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
  };

  // Logout action
  const logout = async () => {
    await fetch(`${apiOrigin}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}