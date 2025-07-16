import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Check login status on mount
  useEffect(() => {
    fetch('http://localhost:8000/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data.username ? { username: data.username } : null));
  }, []);

  // Login action
  const login = async (username, password) => {

    // Call to the login API endpoint
    const res = await fetch('http://localhost:8000/login', {
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
    await fetch('http://localhost:8000/logout', {
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