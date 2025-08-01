import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, List, ListItem, ListItemText, IconButton, MenuItem, Select, InputLabel, FormControl, Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ExerciseTypePage() {

  const apiOrigin = import.meta.env.VITE_API_ORIGIN;

  // Init state variables
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const muscleGroups = [
    "Chest", "Back", "Shoulders", "Arms", "Legs", "Core"
  ];
  const [muscleGroup, setMuscleGroup] = useState('');
  const [photo, setPhoto] = useState(null);
  const [editMuscleGroup, setEditMuscleGroup] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);

  useEffect(() => {
    fetch(`${apiOrigin}/exercise_types`, { credentials: 'include' })
      .then(res => res.json())
      .then(setExerciseTypes);
  }, [refresh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('muscle_group', muscleGroup);
    if (photo) formData.append('photo', photo);
    const res = await fetch(`${apiOrigin}/exercise_types`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (res.ok) {
      setName('');
      setDescription('');
      setMuscleGroup('');
      setPhoto(null);
      setRefresh(r => !r);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to add exercise type');
    }
  };

  const handleEdit = (et) => {
    setEditingId(et.id);
    setEditName(et.name);
    setEditDescription(et.description || '');
    setEditMuscleGroup(et.muscle_group || '');
    setEditPhoto(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('description', editDescription);
    formData.append('muscle_group', editMuscleGroup);
    if (editPhoto) formData.append('photo', editPhoto);
    const res = await fetch(`${apiOrigin}/exercise_types/${editingId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    if (res.ok) {
      setEditingId(null);
      setRefresh(r => !r);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update exercise type');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exercise type?')) return;
    const res = await fetch(`${apiOrigin}/exercise_types/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setRefresh(r => !r);
    } else {
      setError('Failed to delete exercise type');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Create New Exercise Type</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField
            label="Name"
            value={name}
            required
            fullWidth
            margin="normal"
            onChange={e => setName(e.target.value)}
          />
          <TextField
            label="Description"
            value={description}
            fullWidth
            margin="normal"
            onChange={e => setDescription(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Muscle Group</InputLabel>
            <Select
              value={muscleGroup}
              label="Muscle Group"
              onChange={e => setMuscleGroup(e.target.value)}
              required
            >
              {muscleGroups.map(group => (
                <MenuItem key={group} value={group}>{group}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            {photo ? photo.name : 'Upload Photo'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => setPhoto(e.target.files[0])}
            />
          </Button>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Add Exercise Type
          </Button>
        </form>
        <Typography variant="h6" mt={4}>Existing Exercise Types</Typography>
        <List sx={{ width: '100%' }}>
          {exerciseTypes.map(et => (
            <ListItem
              key={et.id}
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
              secondaryAction={
                editingId === et.id ? null : (
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(et)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(et.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )
              }
            >
              {/* Square, large image */}
              {et.photo_url && (
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
                    src={et.photo_url}
                    alt={et.name}
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
                <Typography variant="subtitle1" fontWeight={600}>{et.name}</Typography>
                <Typography variant="body2" color="text.secondary">{et.muscle_group}</Typography>
                <Typography variant="body2" color="text.secondary">{et.description}</Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}