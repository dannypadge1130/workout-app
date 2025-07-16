import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Global Contexts
import { UserProvider } from './contexts/UserContext';

// Global Component
import HamburgerMenu from './components/HamburgerMenu';
import RequireAuth from './components/RequireAuth';

// Pages
import Home from './pages/Home';
import ExerciseTypePage from './pages/ExerciseTypePage';
import WorkoutsPage from './pages/WorkoutsPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';

// Styling
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <HamburgerMenu />
          <div style={{ marginLeft: 60, padding: 20 }}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/exercise-type" element={<RequireAuth><ExerciseTypePage /></RequireAuth>} />
                <Route path="/workouts" element={<RequireAuth><WorkoutsPage /></RequireAuth>} />
                <Route path="/workout/:id" element={<RequireAuth><WorkoutDetailPage /></RequireAuth>} />
            </Routes>
          </div>
        </ThemeProvider>
      </Router>
    </UserProvider>
  );
}

export default App;