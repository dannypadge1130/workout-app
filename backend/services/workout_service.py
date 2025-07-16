from models import db, Workout, Exercise, ExerciseSet

def create_workout(date, todays_weight, exercises_data):
    workout = Workout(date=date, todays_weight=todays_weight)
    db.session.add(workout)
    db.session.flush()  # Get workout.id before committing

    for exercise_data in exercises_data:
        exercise = Exercise(
            workout_id=workout.id,
            exercise_type_id=exercise_data['exercise_type_id']
        )
        db.session.add(exercise)
        db.session.flush()  # Get exercise.id

        for set_data in exercise_data.get('sets', []):
            exercise_set = ExerciseSet(
                exercise_id=exercise.id,
                reps=set_data['reps'],
                weight=set_data['weight']
            )
            db.session.add(exercise_set)

    db.session.commit()
    return workout

def get_all_workouts():
    return Workout.query.all()

def get_workout_by_id(workout_id):
    return Workout.query.get(workout_id)