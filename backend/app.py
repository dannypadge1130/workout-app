import json
import os

from flask import Flask, request, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from models import db, Exercise, Workout, ExerciseType, ExerciseSet
from services.exercise_type_service import (
    create_exercise_type, get_all_exercise_types,
    update_exercise_type, delete_exercise_type
)
from services.workout_service import (
    create_workout, get_all_workouts, 
    get_workout_by_id
)
from services.exercise_service import (
    create_exercise, get_exercises,
    create_exercise_set, get_exercise_sets
)
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')

login_manager = LoginManager()
login_manager.init_app(app)

# Simple user model (for single user)
class User(UserMixin):
    def __init__(self, id):
        self.id = id

# Replace with your own username/password
USERNAME = os.environ.get('USERNAME')
PASSWORD = os.environ.get('PASSWORD')

origins = os.environ.get('APP_ORIGIN', '').split(',')
CORS(app, supports_credentials=True, origins=origins)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///workout.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    if user_id == USERNAME:
        return User(user_id)
    return None

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == USERNAME and password == PASSWORD:
        user = User(username)
        login_user(user)
        return jsonify({'success': True})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'success': True})

@app.route('/me')
def me():
    if current_user.is_authenticated:
        return jsonify({'username': current_user.id})
    return jsonify({'username': None})

# Create a new Workout
@app.route('/workouts', methods=['POST'])
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
@app.route('/workouts', methods=['GET'])
@login_required
def get_all_workouts_route():
    workouts = get_all_workouts()
    return jsonify([wk.to_dict() for wk in workouts])

# Fetch a single Workout by ID
@app.route('/workouts/<int:workout_id>', methods=['GET'])
@login_required
def get_workout_by_id_route(workout_id):
    workout = get_workout_by_id(workout_id)
    if workout is None:
        return jsonify({'error': 'Workout not found'}), 404
    return jsonify(workout.to_dict())

# Create a new Exercise Type
@app.route('/exercise_types', methods=['POST'])
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
@app.route('/exercise_types', methods=['GET'])
@login_required
def get_exercise_types_route():
    exercise_types = get_all_exercise_types()
    return jsonify([et.to_dict() for et in exercise_types])

# Update an Exercise Type
@app.route('/exercise_types/<int:exercise_type_id>', methods=['PUT'])
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
@app.route('/exercise_types/<int:exercise_type_id>', methods=['DELETE'])
@login_required
def delete_exercise_type_route(exercise_type_id):
    success = delete_exercise_type(exercise_type_id)
    if not success:
        return jsonify({'error': 'Exercise type not found'}), 404
    return jsonify({'success': True})

# Create Exercise
@app.route('/exercises', methods=['POST'])
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
@app.route('/exercises', methods=['GET'])
@login_required
def list_exercises_route():
    workout_id = request.args.get('workout_id')
    exercises = get_exercises(workout_id)
    return jsonify([e.to_dict() for e in exercises])

# Create ExerciseSet
@app.route('/exercise_sets', methods=['POST'])
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
@app.route('/exercise_sets', methods=['GET'])
@login_required
def list_exercise_sets_route():
    exercise_id = request.args.get('exercise_id')
    sets = get_exercise_sets(exercise_id)
    return jsonify([s.to_dict() for s in sets])

@app.route('/')
def home():
    return "Workout Tracker App is running"

if __name__ == '__main__':
    app.run(debug=True, port=8000)