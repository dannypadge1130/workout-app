import json
import os

from flask_cors import CORS
from dotenv import load_dotenv

from flask import Flask
from extensions import db, login_manager

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    login_manager.init_app(app)

    from models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    with app.app_context():
        # init db
        db.create_all()

        # register routes
        from routes import routes
        app.register_blueprint(routes)  # Register routes

    origins = os.environ.get('APP_ORIGIN', '').split(',')
    CORS(app, supports_credentials=True, origins=origins)

    return app

app = create_app()