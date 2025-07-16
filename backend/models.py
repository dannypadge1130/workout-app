from extensions import db
from flask_login import UserMixin

# Simple user model (for single user)
class User(UserMixin):
    def __init__(self, id):
        self.id = id

# Workout for the day. This includes the current date and personal weight for the day
class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)
    todays_weight = db.Column(db.Double, nullable=False)

    # Has a one-to-many relationship with exercises
    exercises = db.relationship('Exercise', backref='workout', lazy=True)

    def __init__(self, date, todays_weight):
        self.date = date
        self.todays_weight = todays_weight

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'todays_weight': self.todays_weight,
            'exercises': [exercise.to_dict() for exercise in self.exercises]
        }

# Type of exercise performed
class ExerciseType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=True)

    def __init__(self, name, description=None):
        self.name = name
        self.description = description

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

# Exercise performed during workout
class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey('workout.id'), nullable=False)
    
    # The type of exercise
    exercise_type_id = db.Column(db.Integer, db.ForeignKey('exercise_type.id'), nullable=False)
    exercise_type = db.relationship('ExerciseType')

    # The sets performed during the exercise
    sets = db.relationship('ExerciseSet', backref='exercise', lazy=True)

    def __init__(self, workout_id, exercise_type_id):
        self.workout_id = workout_id
        self.exercise_type_id = exercise_type_id

    def to_dict(self):
        return {
            'id': self.id,
            'workout_id': self.workout_id,
            'exercise_type': self.exercise_type.to_dict() if self.exercise_type else None,
            'sets': [exercise_set.to_dict() for exercise_set in self.sets]
        }

class ExerciseSet(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # The exercise this set belongs too
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=False)

    reps = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Integer, nullable=False)

    def __init__(self, exercise_id, reps, weight):
        self.exercise_id = exercise_id
        self.reps = reps
        self.weight = weight

    def to_dict(self):
        return {
            'id': self.id,
            'reps': self.reps,
            'weight': self.weight
        }
