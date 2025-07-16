import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Alert, Select, MenuItem, List, ListItem, ListItemText, CircularProgress, InputLabel, FormControl
} from '@mui/material';

export default function WorkoutDetailPage() {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [sets, setSets] = useState([{ reps: '', weight: '' }]);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/workouts/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setWorkout(data);
        setLoading(false);
      });
  }, [id, refresh]);

  // Fetch exercise types
  useEffect(() => {
    fetch('http://localhost:8000/exercise_types', { credentials: 'include' })
      .then(res => res.json())
      .then(setExerciseTypes);
  }, []);

  // Add a new set row
  const addSet = () => setSets([...sets, { reps: '', weight: '' }]);

  // Handle set value change
  const handleSetChange = (idx, field, value) => {
    const newSets = sets.slice();
    newSets[idx][field] = value;
    setSets(newSets);
  };

  // Submit new exercise with sets
  const handleAddExercise = async (e) => {
    e.preventDefault();
    setError('');
    // 1. Create the exercise
    const res = await fetch('http://localhost:8000/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        workout_id: id,
        exercise_type_id: selectedType
      }),
    });
    if (!res.ok) {
      setError('Failed to add exercise');
      return;
    }
    const exercise = await res.json();
    // 2. Add sets
    for (const set of sets) {
      await fetch('http://localhost:8000/exercise_sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          exercise_id: exercise.id,
          reps: parseInt(set.reps, 10),
          weight: parseFloat(set.weight)
        }),
      });
    }
    setSelectedType('');
    setSets([{ reps: '', weight: '' }]);
    setRefresh(r => !r);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
      <CircularProgress />
    </Box>
  );
  if (!workout) return <Alert severity="error">Workout not found.</Alert>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Workout for {workout.date}</Typography>
        <Typography variant="subtitle1" gutterBottom>Today's Weight: {workout.todays_weight}</Typography>
        <Box mt={3} mb={2}>
          <Typography variant="h6">Add Exercise</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleAddExercise}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="exercise-type-label">Exercise Type</InputLabel>
              <Select
                labelId="exercise-type-label"
                value={selectedType}
                label="Exercise Type"
                onChange={e => setSelectedType(e.target.value)}
                required
              >
                <MenuItem value=""><em>Select...</em></MenuItem>
                {exerciseTypes.map(et => (
                  <MenuItem key={et.id} value={et.id}>{et.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2">Sets:</Typography>
              {sets.map((set, idx) => (
                <Box key={idx} display="flex" gap={2} mb={1}>
                  <TextField
                    label="Reps"
                    type="number"
                    value={set.reps}
                    onChange={e => handleSetChange(idx, 'reps', e.target.value)}
                    required
                    size="small"
                  />
                  <TextField
                    label="Weight"
                    type="number"
                    value={set.weight}
                    onChange={e => handleSetChange(idx, 'weight', e.target.value)}
                    required
                    size="small"
                  />
                </Box>
              ))}
              <Button type="button" onClick={addSet} sx={{ mt: 1 }}>
                Add Set
              </Button>
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Add Exercise
            </Button>
          </form>
        </Box>
        <Typography variant="h6" mt={4}>Exercises in this Workout</Typography>
        {workout.exercises.length === 0 && <Typography>No exercises yet.</Typography>}
        <List>
          {workout.exercises.map(ex => (
            <ListItem key={ex.id} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2, borderRadius: 2, background: '#f1f8e9' }}>
              <Typography variant="subtitle1" fontWeight={600}>{ex.exercise_type?.name}</Typography>
              <List sx={{ width: '100%' }}>
                {ex.sets.map((set, i) => (
                  <ListItem key={i} sx={{ pl: 0 }}>
                    <ListItemText primary={`${set.reps} reps @ ${set.weight} lbs`} />
                  </ListItem>
                ))}
              </List>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}