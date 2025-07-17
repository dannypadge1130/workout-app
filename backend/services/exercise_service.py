from models import db, Exercise

# Create a new exercise
def create_exercise(workout_id, exercise_type_id):
    exercise = Exercise(workout_id=workout_id, exercise_type_id=exercise_type_id)
    db.session.add(exercise)
    db.session.commit()
    return exercise

# Delete an exercise
def delete_exercise(exercise_id):
    exercise = Exercise.query.get(exercise_id)
    if not exercise:
        return False
    db.session.delete(exercise)
    db.session.commit()
    return True

# Get an exercise by id
def get_exercise_by_id(exercise_id):
    return Exercise.query.get(exercise_id)

# Get all exercises
def get_exercises(workout_id=None):
    if workout_id:
        return Exercise.query.filter_by(workout_id=workout_id).all()
    return Exercise.query.all()