import React, { useState } from 'react';

// Contexts
import { useUser } from '../contexts/UserContext';

// UI
import { Button, TextField, Typography, Paper, Box, Alert } from '@mui/material';

export default function LoginPage() {
  // Init state variables
  const { login } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  // Function to handle the submit action
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call login
      await login(username, password);
      // UserContext will update and Home will re-render
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            required
            fullWidth
            margin="normal"
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            required
            fullWidth
            margin="normal"
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
} 