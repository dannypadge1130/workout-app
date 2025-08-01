import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Paper, Typography, List, ListItem, ListItemText, CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function WorkoutsPage() {
  
  const apiOrigin = import.meta.env.VITE_API_ORIGIN;
  
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiOrigin}/workouts`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // Sort by date descending
        setWorkouts(data.sort((a, b) => b.date.localeCompare(a.date)));
        setLoading(false);
      });
  }, []);

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Delete this workout?')) return;
    await fetch(`${apiOrigin}/workouts/${workoutId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setWorkouts(workouts => workouts.filter(wk => wk.id !== workoutId));
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>All Workouts</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {workouts.length === 0 && <Typography>No workouts found.</Typography>}
            {workouts.map(wk => (
              <ListItem
                key={wk.id}
                component={Link}
                to={`/workout/${wk.id}`}
                button
                sx={{ mb: 1, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <ListItemText
                  primary={`Date: ${wk.date}`}
                  secondary={`Today's Weight: ${wk.todays_weight}`}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={e => {
                    e.preventDefault(); // Prevent navigation
                    handleDeleteWorkout(wk.id);
                  }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}