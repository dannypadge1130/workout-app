import React, { useEffect, useState } from 'react';

function ExerciseTypeList() {
  const [exerciseTypes, setExerciseTypes] = useState([]);

  const apiOrigin = import.meta.env.VITE_API_ORIGIN;

  useEffect(() => {
    fetch(`${apiOrigin}/exercise_types`)
      .then(res => res.json())
      .then(data => setExerciseTypes(data));
  }, []);

  return (
    <div>
      <h2>Exercise Types</h2>
      <ul>
        {exerciseTypes.map(et => (
          <li key={et.id}>
            <strong>{et.name}</strong> {et.description && `- ${et.description}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExerciseTypeList;