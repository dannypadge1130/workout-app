import os

from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user

from extensions import login_manager
from models import User

## Import required services to support controllers

# Exercise Type Services
from services.exercise_type_service import (
    create_exercise_type, get_all_exercise_types, get_exercise_type_by_id,
    update_exercise_type, delete_exercise_type
)

# Workout Services
from services.workout_service import (
    create_workout, delete_workout, get_all_workouts, 
    get_workout_by_id, update_workout
)

# Exercise Services
from services.exercise_service import (
    create_exercise, get_exercise_by_id, get_exercises,
    delete_exercise
)

# Exercise Set Services
from services.excercise_set_service import (
    create_exercise_set, get_exercise_set_by_id, get_exercise_sets,
    update_exercise_set, delete_exercise_set
)

# Replace with your own username/password
USERNAME = os.environ.get('USERNAME')
PASSWORD = os.environ.get('PASSWORD')

routes = Blueprint('routes', __name__)

## USER ROUTES

# Load user based on User ID
@login_manager.user_loader
def load_user(user_id):
    if user_id == USERNAME:
        return User(user_id)
    return None

# Login route
@routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == USERNAME and password == PASSWORD:
        user = User(username)
        login_user(user)
        return jsonify({'success': True})
    return jsonify({'error': 'Invalid credentials'}), 401

# Logout route
@routes.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'success': True})

# Pull details about currently authenticated user
@routes.route('/me')
def me():
    if current_user.is_authenticated:
        return jsonify({'username': current_user.id})
    return jsonify({'username': None})


### WORKOUT ROUTES

# Create a new workout
@routes.route('/workouts', methods=['POST'])
@login_required
def create_workout_route():
    data = request.get_json()
    date = data.get('date')
    todays_weight = data.get('todays_weight')
    exercises = data.get('exercises', [])

    if not date or todays_weight is None:
        return jsonify({'error': 'date and todays_weight required'}), 400
    
    try:
        workout = create_workout(date, todays_weight, exercises)
        return jsonify(workout.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Fetch all Workouts
@routes.route('/workouts', methods=['GET'])
@login_required
def get_all_workouts_route():
    workouts = get_all_workouts()
    return jsonify([wk.to_dict() for wk in workouts])

# Fetch a single Workout by ID
@routes.route('/workouts/<int:workout_id>', methods=['GET'])
@login_required
def get_workout_by_id_route(workout_id):
    workout = get_workout_by_id(workout_id)
    if workout is None:
        return jsonify({'error': 'Workout not found'}), 404
    return jsonify(workout.to_dict())

# Update a Workout
@routes.route('/workouts/<int:workout_id>', methods=['PUT'])
@login_required
def update_workout_route(workout_id):
    data = request.get_json()
    workout = update_workout(workout_id, data)
    if not workout:
        return jsonify({'error': 'Workout not found'}), 404
    return jsonify(workout.to_dict())

# Delete a Workout
@routes.route('/workouts/<int:workout_id>', methods=['DELETE'])
@login_required
def delete_workout_route(workout_id):
    success = delete_workout(workout_id)
    if not success:
        return jsonify({'error': 'Workout not found'}), 404
    return jsonify({'success': True})

### EXCERCISE TYPE ROUTES

# Create a new Exercise Type
@routes.route('/exercise_types', methods=['POST'])
@login_required
def create_exercise_type_route():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    try:
        exercise_type = create_exercise_type(name, description)
        return jsonify(exercise_type.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

# Fetch all Exercise Types
@routes.route('/exercise_types', methods=['GET'])
@login_required
def get_exercise_types_route():
    exercise_types = get_all_exercise_types()
    return jsonify([et.to_dict() for et in exercise_types])

# Fetch an Exercise Type by ID
@routes.route('/exercise_types/<int:exercise_type_id>', methods=['GET'])
@login_required
def get_exercise_type_by_id_route(exercise_type_id):
    exercise_type = get_exercise_type_by_id(exercise_type_id)
    if exercise_type is None:
        return jsonify({'error': 'Exercise type not found'}), 404
    return jsonify(exercise_type.to_dict())

# Update an Exercise Type
@routes.route('/exercise_types/<int:exercise_type_id>', methods=['PUT'])
@login_required
def update_exercise_type_route(exercise_type_id):
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    try:
        exercise_type = update_exercise_type(exercise_type_id, name, description)
        if exercise_type is None:
            return jsonify({'error': 'Exercise type not found'}), 404
        return jsonify(exercise_type.to_dict())
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

# Delete an Exercise Type
@routes.route('/exercise_types/<int:exercise_type_id>', methods=['DELETE'])
@login_required
def delete_exercise_type_route(exercise_type_id):
    success = delete_exercise_type(exercise_type_id)
    if not success:
        return jsonify({'error': 'Exercise type not found'}), 404
    return jsonify({'success': True})

### EXCERCISE ROUTES

# Create Exercise
@routes.route('/exercises', methods=['POST'])
@login_required
def create_exercise_route():
    data = request.get_json()
    workout_id = data.get('workout_id')
    exercise_type_id = data.get('exercise_type_id')
    if not workout_id or not exercise_type_id:
        return jsonify({'error': 'workout_id and exercise_type_id are required'}), 400
    exercise = create_exercise(workout_id, exercise_type_id)
    return jsonify(exercise.to_dict()), 201

# List Exercises (optionally by workout)
@routes.route('/exercises', methods=['GET'])
@login_required
def list_exercises_route():
    workout_id = request.args.get('workout_id')
    exercises = get_exercises(workout_id)
    return jsonify([e.to_dict() for e in exercises])

# Fetch an Exercise by ID
@routes.route('/exercises/<int:exercise_id>', methods=['GET'])
@login_required
def get_exercise_by_id_route(exercise_id):
    exercise = get_exercise_by_id(exercise_id)
    if exercise is None:
        return jsonify({'error': 'Exercise not found'}), 404
    return jsonify(exercise.to_dict())

# Delete an Exercise
@routes.route('/exercises/<int:exercise_id>', methods=['DELETE'])
@login_required
def delete_exercise_route(exercise_id):
    success = delete_exercise(exercise_id)
    if not success:
        return jsonify({'error': 'Exercise not found'}), 404
    return jsonify({'success': True})

### EXCERCISE SET ROUTES

# Create ExerciseSet
@routes.route('/exercise_sets', methods=['POST'])
@login_required
def create_exercise_set_route():
    data = request.get_json()
    exercise_id = data.get('exercise_id')
    reps = data.get('reps')
    weight = data.get('weight')
    if not exercise_id or reps is None or weight is None:
        return jsonify({'error': 'exercise_id, reps, and weight are required'}), 400
    exercise_set = create_exercise_set(exercise_id, reps, weight)
    return jsonify(exercise_set.to_dict()), 201

# List ExerciseSets (optionally by exercise)
@routes.route('/exercise_sets', methods=['GET'])
@login_required
def list_exercise_sets_route():
    exercise_id = request.args.get('exercise_id')
    sets = get_exercise_sets(exercise_id)
    return jsonify([s.to_dict() for s in sets])

# Fetch an Exercise Set by ID
@routes.route('/exercise_sets/<int:exercise_set_id>', methods=['GET'])
@login_required
def get_exercise_set_by_id_route(exercise_set_id):
    exercise_set = get_exercise_set_by_id(exercise_set_id)
    if exercise_set is None:
        return jsonify({'error': 'Exercise set not found'}), 404
    return jsonify(exercise_set.to_dict())

# Update an Exercise Set
@routes.route('/exercise_sets/<int:exercise_set_id>', methods=['PUT'])
@login_required
def update_exercise_set_route(exercise_set_id):
    data = request.get_json()
    exercise_set = update_exercise_set(exercise_set_id, data)
    if not exercise_set:
        return jsonify({'error': 'Exercise set not found'}), 404
    return jsonify(exercise_set.to_dict())

# Delete an Exercise Set
@routes.route('/exercise_sets/<int:exercise_set_id>', methods=['DELETE'])
@login_required
def delete_exercise_set_route(exercise_set_id):
    success = delete_exercise_set(exercise_set_id)
    if not success:
        return jsonify({'error': 'Exercise set not found'}), 404
    return jsonify({'success': True})