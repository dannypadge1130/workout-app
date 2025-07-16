import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Contexts
import { useUser } from '../contexts/UserContext';

const menuStyle = {
  position: 'fixed',
  top: 10,
  left: 10,
  zIndex: 1000,
};

const drawerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: 200,
  height: '100%',
  background: '#222',
  color: '#fff',
  padding: 20,
  boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    setOpen(false);
  }

  return (
    <div style={menuStyle}>
      <button onClick={() => setOpen(!open)} style={{ fontSize: 24, background: 'none', border: 'none', color: '#222' }}>
        ☰
      </button>
      {open && (
        <div style={drawerStyle}>
          <button onClick={() => setOpen(false)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#fff', fontSize: 24 }}>×</button>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }} onClick={() => setOpen(false)}>New Workout</Link>
          <Link to="/workouts" style={{ color: '#fff', textDecoration: 'none' }} onClick={() => setOpen(false)}>Old Workouts</Link>
          <Link to="/exercise-type" style={{ color: '#fff', textDecoration: 'none' }} onClick={() => setOpen(false)}>Exercise Types</Link>
          {user && (
            <button onClick={handleLogout} style={{ marginTop: 'auto', color: '#fff', background: 'none', border: 'none', textAlign: 'left' }}>
                Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;