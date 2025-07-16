from models import db, Exercise, ExerciseSet

def create_exercise(workout_id, exercise_type_id):
    exercise = Exercise(workout_id=workout_id, exercise_type_id=exercise_type_id)
    db.session.add(exercise)
    db.session.commit()
    return exercise

def get_exercises(workout_id=None):
    if workout_id:
        return Exercise.query.filter_by(workout_id=workout_id).all()
    return Exercise.query.all()

def create_exercise_set(exercise_id, reps, weight):
    exercise_set = ExerciseSet(exercise_id=exercise_id, reps=reps, weight=weight)
    db.session.add(exercise_set)
    db.session.commit()
    return exercise_set

def get_exercise_sets(exercise_id=None):
    if exercise_id:
        return ExerciseSet.query.filter_by(exercise_id=exercise_id).all()
    return ExerciseSet.query.all()