import React, { useState } from 'react';
import { Box, TextField, IconButton, Button, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const apiOrigin = import.meta.env.VITE_API_ORIGIN;

export default function ExerciseEditForm({ exercise, onSave, onCancel }) {
  const [editSets, setEditSets] = useState(exercise.sets);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const handleSetChange = (idx, field, value) => {
    const newSets = editSets.slice();
    newSets[idx][field] = value;
    setEditSets(newSets);
  };

  const handleDeleteSet = async (setId) => {
    await fetch(`${apiOrigin}/exercise_sets/${setId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setEditSets(editSets.filter(s => s.id !== setId));
  };

  const handleSave = async () => {
    setSaving(true);
    setEditError('');
    for (const set of editSets) {
      await fetch(`${apiOrigin}/exercise_sets/${set.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reps: set.reps, weight: set.weight }),
      });
    }
    setSaving(false);
    onSave();
  };

  return (
    <Box>
      {editSets.map((set, idx) => (
        <Box key={set.id} display="flex" alignItems="center" gap={1} mb={1}>
          <TextField
            label="Reps"
            type="number"
            value={set.reps}
            onChange={e => handleSetChange(idx, 'reps', e.target.value)}
            size="small"
          />
          <TextField
            label="Weight"
            type="number"
            value={set.weight}
            onChange={e => handleSetChange(idx, 'weight', e.target.value)}
            size="small"
          />
          <IconButton onClick={() => handleDeleteSet(set.id)} color="error"><DeleteIcon /></IconButton>
        </Box>
      ))}
      <Button onClick={handleSave} startIcon={<SaveIcon />} disabled={saving} sx={{ mr: 1 }}>Save</Button>
      <Button onClick={onCancel} startIcon={<CancelIcon />} disabled={saving}>Cancel</Button>
      {editError && <Alert severity="error">{editError}</Alert>}
    </Box>
  );
}
