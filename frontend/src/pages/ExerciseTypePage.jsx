import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, List, ListItem, ListItemText, IconButton
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

  useEffect(() => {
    fetch(`${apiOrigin}/exercise_types`, { credentials: 'include' })
      .then(res => res.json())
      .then(setExerciseTypes);
  }, [refresh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${apiOrigin}/exercise_types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setName('');
      setDescription('');
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
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${apiOrigin}/exercise_types/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: editName, description: editDescription }),
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
        <form onSubmit={handleSubmit}>
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Add Exercise Type
          </Button>
        </form>
        <Typography variant="h6" mt={4}>Existing Exercise Types</Typography>
        <List>
          {exerciseTypes.map(et => (
            <ListItem key={et.id} sx={{ mb: 1, borderRadius: 2, background: '#f1f8e9' }}
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
              {editingId === et.id ? (
                <form onSubmit={handleEditSubmit} style={{ width: '100%' }}>
                  <TextField
                    value={editName}
                    required
                    fullWidth
                    margin="dense"
                    onChange={e => setEditName(e.target.value)}
                  />
                  <TextField
                    value={editDescription}
                    fullWidth
                    margin="dense"
                    onChange={e => setEditDescription(e.target.value)}
                  />
                  <Box display="flex" gap={1} mt={1}>
                    <Button type="submit" variant="contained" color="primary" size="small">Save</Button>
                    <Button type="button" onClick={() => setEditingId(null)} size="small">Cancel</Button>
                  </Box>
                </form>
              ) : (
                <ListItemText
                  primary={<strong>{et.name}</strong>}
                  secondary={et.description}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}