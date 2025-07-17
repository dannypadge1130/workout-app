from models import db, ExerciseType

# Create a new exercise type
def create_exercise_type(name, description=None):
    if ExerciseType.query.filter_by(name=name).first():
        raise ValueError("Exercise type already exists")
    exercise_type = ExerciseType(name=name, description=description)
    db.session.add(exercise_type)
    db.session.commit()
    return exercise_type

# Get all exercise types
def get_all_exercise_types():
    return ExerciseType.query.all()

# Get an exercise type by id
def get_exercise_type_by_id(exercise_type_id):
    return ExerciseType.query.get(exercise_type_id)

# Update an exercise type
def update_exercise_type(exercise_type_id, name, description=None):
    exercise_type = ExerciseType.query.get(exercise_type_id)
    if not exercise_type:
        return None
    if name:
        # Check for duplicate name
        existing = ExerciseType.query.filter_by(name=name).first()
        if existing and existing.id != exercise_type_id:
            raise ValueError("Exercise type with this name already exists")
        exercise_type.name = name
    exercise_type.description = description
    db.session.commit()
    return exercise_type

# Delete an exercise type
def delete_exercise_type(exercise_type_id):
    exercise_type = ExerciseType.query.get(exercise_type_id)
    if not exercise_type:
        return False
    db.session.delete(exercise_type)
    db.session.commit()
    return True