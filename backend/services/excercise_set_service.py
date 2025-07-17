from models import db, ExerciseSet

# Create a new exercise set
def create_exercise_set(exercise_id, reps, weight):
    exercise_set = ExerciseSet(exercise_id=exercise_id, reps=reps, weight=weight)
    db.session.add(exercise_set)
    db.session.commit()
    return exercise_set

# Get all exercise sets
def get_exercise_sets(exercise_id=None):
    if exercise_id:
        return ExerciseSet.query.filter_by(exercise_id=exercise_id).all()
    return ExerciseSet.query.all()

# Get an exercise set by id
def get_exercise_set_by_id(exercise_set_id): 
    return ExerciseSet.query.get(exercise_set_id)

# Delete an exercise set
def delete_exercise_set(exercise_set_id):
    exercise_set = ExerciseSet.query.get(exercise_set_id)
    if not exercise_set:
        return False
    db.session.delete(exercise_set)
    db.session.commit()
    return True

# Update an exercise set
def update_exercise_set(exercise_set_id, data):
    exercise_set = ExerciseSet.query.get(exercise_set_id)
    if not exercise_set:
        return False
    exercise_set.reps = data['reps']
    exercise_set.weight = data['weight']
    db.session.commit()
    return exercise_set