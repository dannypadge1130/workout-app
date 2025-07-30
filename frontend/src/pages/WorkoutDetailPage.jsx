import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Alert, Select, MenuItem, List, ListItem, ListItemText, CircularProgress, InputLabel, FormControl, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExerciseEditForm from '../components/ExerciseEditForm';

const apiOrigin = import.meta.env.VITE_API_ORIGIN;

export default function WorkoutDetailPage() {

  // Extract the workout ID from the URL
  const { id } = useParams();

  // State variables
  const [workout, setWorkout] = useState(null);
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(''); // Selected exercise type
  const [sets, setSets] = useState([{ reps: '', weight: '' }]); // Sets for the selected exercise type
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [editingWeight, setEditingWeight] = useState(false);
  const [weightValue, setWeightValue] = useState(workout?.todays_weight);
  const [weightError, setWeightError] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [previousExercise, setPreviousExercise] = useState(null);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  // Fetch the workout data
  useEffect(() => {
    setLoading(true);
    fetch(`${apiOrigin}/workouts/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setWorkout(data);
        setWeightValue(data.todays_weight); // Initialize weightValue
        setLoading(false);
      });
  }, [id, refresh]);

  // Fetch the exercise types
  useEffect(() => {
    fetch(`${apiOrigin}/exercise_types`, { credentials: 'include' })
      .then(res => res.json())
      .then(setExerciseTypes);
  }, []);

  // Add a new set to the selected exercise type
  const addSet = () => setSets([...sets, { reps: '', weight: '' }]);

  // Remove a set before adding the exercise
  const removeSet = (idx) => {
    if (sets.length === 1) return; // Always keep at least one set
    setSets(sets.filter((_, i) => i !== idx));
  };

  // Handle changes to the sets
  const handleSetChange = (idx, field, value) => {
    const newSets = sets.slice();
    newSets[idx][field] = value;
    setSets(newSets);
  };

  // Fetch previous exercise when exercise type is selected
  const handleExerciseTypeChange = async (exerciseTypeId) => {
    setSelectedType(exerciseTypeId);
    if (!exerciseTypeId) {
      setPreviousExercise(null);
      return;
    }

    setLoadingPrevious(true);
    try {
      const res = await fetch(`${apiOrigin}/exercises?exercise_type_id=${exerciseTypeId}`, { 
        credentials: 'include' 
      });
      if (res.ok) {
        const exercises = await res.json();
        if (exercises.length > 0) {
          // Get the most recent exercise (excluding current workout)
          const currentWorkoutExercises = exercises.filter(ex => ex.workout_id !== parseInt(id));
          if (currentWorkoutExercises.length > 0) {
            const mostRecent = currentWorkoutExercises.sort((a, b) => 
              new Date(b.workout?.date) - new Date(a.workout?.date)
            )[0];
            setPreviousExercise(mostRecent);
          } else {
            setPreviousExercise(null);
          }
        } else {
          setPreviousExercise(null);
        }
      }
    } catch (error) {
      console.error('Error fetching previous exercise:', error);
      setPreviousExercise(null);
    }
    setLoadingPrevious(false);
  };

  // Use previous sets as starting point
  const usePreviousSets = () => {
    if (previousExercise && previousExercise.sets) {
      setSets(previousExercise.sets.map(set => ({
        reps: set.reps.toString(),
        weight: set.weight.toString()
      })));
    }
  };

  // Handle adding a new exercise
  const handleAddExercise = async (e) => {
    e.preventDefault();
    setError('');
    // 1. Create the exercise
    const res = await fetch(`${apiOrigin}/exercises`, {
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
      await fetch(`${apiOrigin}/exercise_sets`, {
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

  const handleEditExercise = (exerciseId) => setEditingExerciseId(exerciseId);
  const handleCancelEdit = () => setEditingExerciseId(null);

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm('Delete this exercise?')) return;
    await fetch(`${apiOrigin}/exercises/${exerciseId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setRefresh(r => !r);
  };

  const handleEditWeight = () => {
    setEditingWeight(true);
    setWeightValue(workout?.todays_weight);
  };

  const handleCancelWeight = () => {
    setEditingWeight(false);
    setWeightError('');
  };

  const handleSaveWeight = async () => {
    setSavingWeight(true);
    setWeightError('');
    const res = await fetch(`${apiOrigin}/workouts/${workout?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ todays_weight: parseFloat(weightValue) }),
    });
    if (res.ok) {
      setEditingWeight(false);
      setRefresh(r => !r); // Refresh workout details
    } else {
      setWeightError('Failed to update weight');
    }
    setSavingWeight(false);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
      <CircularProgress />
    </Box>
  );
  if (!workout) return <Alert severity="error">Workout not found.</Alert>;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Workout Header */}
        <Typography variant="h5" gutterBottom>Workout for {workout.date}</Typography>
        {/* Today's Weight under Workout data */}
        <Box mb={2} display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1" gutterBottom sx={{ mr: 1 }}>
            Today's Weight:
          </Typography>
          {editingWeight ? (
            <>
              <TextField
                type="number"
                value={weightValue}
                onChange={e => setWeightValue(e.target.value)}
                size="small"
                sx={{ width: 100 }}
              />
              <IconButton onClick={handleSaveWeight} disabled={savingWeight}><SaveIcon /></IconButton>
              <IconButton onClick={handleCancelWeight} disabled={savingWeight}><CancelIcon /></IconButton>
              {weightError && <Alert severity="error" sx={{ ml: 1 }}>{weightError}</Alert>}
            </>
          ) : (
            <>
              <Typography variant="subtitle1" component="span">{workout.todays_weight}</Typography>
              <IconButton onClick={handleEditWeight} size="small"><EditIcon /></IconButton>
            </>
          )}
        </Box>
        {/* Add Exercise Form */}
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
                onChange={e => handleExerciseTypeChange(e.target.value)}
                required
                renderValue={selected => {
                  const et = exerciseTypes.find(et => et.id === selected);
                  return et ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      {et.photo_url && (
                        <Box
                          component="img"
                          src={et.photo_url}
                          alt={et.name}
                          sx={{
                            width: 40,
                            height: 40,
                            objectFit: 'contain',
                            borderRadius: 0,
                            mr: 1,
                            boxShadow: 1,
                            border: '2px solid #ccc',
                            backgroundColor: '#fff',
                          }}
                        />
                      )}
                      <span>{et.name}</span>
                    </Box>
                  ) : <em>Select...</em>;
                }}
              >
                <MenuItem value=""><em>Select...</em></MenuItem>
                {exerciseTypes.map(et => (
                  <MenuItem key={et.id} value={et.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {et.photo_url && (
                        <Box
                          component="img"
                          src={et.photo_url}
                          alt={et.name}
                          sx={{
                            width: 40,
                            height: 40,
                            objectFit: 'contain',
                            borderRadius: 0,
                            mr: 1,
                            boxShadow: 1,
                            border: '2px solid #ccc',
                            backgroundColor: '#fff',
                          }}
                        />
                      )}
                      <span>{et.name}</span>
                      <Typography variant="caption" color="text.secondary" ml={1}>{et.muscle_group}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Previous Exercise Information */}
            {selectedType && (
              <Box mt={2} p={2} sx={{ background: theme => theme.palette.background.default, borderRadius: 1 }}>
                {loadingPrevious ? (
                  <Typography variant="body2" color="text.secondary">Loading previous workout...</Typography>
                ) : previousExercise ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Last performed: {previousExercise.workout?.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Previous sets:
                    </Typography>
                    <List dense>
                      {previousExercise.sets.map((set, idx) => (
                        <ListItem key={idx} sx={{ py: 0 }}>
                          <ListItemText 
                            primary={`${set.reps} reps @ ${set.weight} lbs`}
                            sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem' } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button 
                      onClick={usePreviousSets} 
                      size="small" 
                      variant="outlined" 
                      sx={{ mt: 1 }}
                    >
                      Use Previous Sets
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No previous workout found for this exercise type.
                  </Typography>
                )}
              </Box>
            )}
            <Box>
              <Typography variant="subtitle2">Sets:</Typography>
              {sets.map((set, idx) => (
                <Box key={idx} display="flex" gap={2} mb={1} alignItems="center">
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
                  <IconButton onClick={() => removeSet(idx)} color="error" size="small" disabled={sets.length === 1}>
                    <DeleteIcon />
                  </IconButton>
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
        {/* Exercises List */}
        <Typography variant="h6" mt={4}>Exercises in this Workout</Typography>
        {workout.exercises.length === 0 && <Typography>No exercises yet.</Typography>}
        <List sx={{ width: '100%' }}>
          {workout.exercises.map(ex => (
            <ListItem
              key={ex.id}
              alignItems="flex-start"
              sx={{
                mb: 2,
                borderRadius: 2,
                background: theme => theme.palette.background.default,
                flexDirection: 'row',
                alignItems: 'center',
                boxShadow: 1,
                p: 2,
                gap: 3,
              }}
            >
              {/* Square, large image */}
              {ex.exercise_type?.photo_url && (
                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    borderRadius: 0,
                    boxShadow: 2,
                    border: '2px solid #ccc',
                    mr: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={ex.exercise_type.photo_url}
                    alt={ex.exercise_type.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </Box>
              )}
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600}>{ex.exercise_type?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{ex.exercise_type?.muscle_group}</Typography>
                <List sx={{ width: '100%' }}>
                  {ex.sets.map((set, i) => (
                    <ListItem key={set.id} sx={{ pl: 0, py: 0.5 }}>
                      <ListItemText primary={`${set.reps} reps @ ${set.weight} lbs`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box display="flex" flexDirection="column" gap={1}>
                {editingExerciseId === ex.id ? (
                  <ExerciseEditForm
                    exercise={ex}
                    onSave={() => { setEditingExerciseId(null); setRefresh(r => !r); }}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <>
                    <IconButton onClick={() => handleEditExercise(ex.id)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteExercise(ex.id)} size="small" color="error"><DeleteIcon /></IconButton>
                  </>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}