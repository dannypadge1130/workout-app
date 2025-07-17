from models import db, Workout, Exercise, ExerciseSet

# Create a new workout
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
        db.session.flush()

        # Init exercise set
        for set_data in exercise_data.get('sets', []):
            exercise_set = ExerciseSet(
                exercise_id=exercise.id,
                reps=set_data['reps'],
                weight=set_data['weight']
            )
            db.session.add(exercise_set)

    db.session.commit()
    return workout

# Get all workouts in descending order by date
def get_all_workouts():
    return Workout.query.order_by(getattr(Workout, "date").desc()).all()

# Get a workout by id
def get_workout_by_id(workout_id):
    return Workout.query.get(workout_id)

# Update a workout
def update_workout(workout_id, data):
    workout = Workout.query.get(workout_id)
    if not workout:
        return None
    for key, value in data.items():
        if hasattr(workout, key):
            setattr(workout, key, value)
    db.session.commit()
    return workout

# Delete a workout
def delete_workout(workout_id):
    workout = Workout.query.get(workout_id)
    if not workout:
        return False
    db.session.delete(workout)
    db.session.commit()
    return True