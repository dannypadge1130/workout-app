import React, { useEffect, useState } from 'react';

function ExerciseTypeList() {
  const [exerciseTypes, setExerciseTypes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/exercise_types')
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