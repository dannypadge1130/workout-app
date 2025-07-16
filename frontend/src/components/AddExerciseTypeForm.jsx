import React, { useState } from 'react';

function AddExerciseTypeForm({ onAdd }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const apiOrigin = import.meta.env.VITE_API_ORIGIN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${apiOrigin}/exercise_types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setName('');
      setDescription('');
      if (onAdd) onAdd();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to add exercise type');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Exercise Type</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          required
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <button type="submit">Add</button>
    </form>
  );
}

export default AddExerciseTypeForm;