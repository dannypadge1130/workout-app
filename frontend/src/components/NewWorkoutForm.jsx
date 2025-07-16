import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';

const apiOrigin = import.meta.env.VITE_API_ORIGIN;

export default function NewWorkoutForm() {
  const [date, setDate] = useState('');
  const [todaysWeight, setTodaysWeight] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${apiOrigin}/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        date,
        todays_weight: parseFloat(todaysWeight),
        exercises: []
      }),
    });
    if (res.ok) {
      const workout = await res.json();
      navigate(`/workout/${workout.id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create workout');
    }
  };

  return (
    <Box sx={{ pt: 1, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 3, minWidth: 320, maxWidth: 400 }}>
        <Typography variant="h5" gutterBottom>New Workout</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Today's Weight"
            type="number"
            step="0.1"
            value={todaysWeight}
            onChange={e => setTodaysWeight(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Start Workout
          </Button>
        </form>
      </Paper>
    </Box>
  );
} 