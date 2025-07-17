from types import NoneType
from werkzeug.utils import secure_filename
from models import db, ExerciseType
from extensions import s3, BUCKET

# Create a new exercise type
def create_exercise_type(data):
    if ExerciseType.query.filter_by(name=data['name']).first():
        raise ValueError("Exercise type already exists")

    photo_url = None
    if 'photo' in data:
        photo_url = upload_photo_to_s3(data['photo'])

    exercise_type = ExerciseType(
        name=data['name'],
        description=data['description'],
        muscle_group=data['muscle_group'],
        photo_url=photo_url
    )
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
def update_exercise_type(exercise_type_id, data):
    exercise_type = ExerciseType.query.get(exercise_type_id)
    if not exercise_type:
        return None

    if 'photo' in data:
        photo_url = upload_photo_to_s3(data['photo'])
        if photo_url:
            exercise_type.photo_url = photo_url

    # Only update allowed fields
    allowed_fields = {'name', 'description', 'muscle_group'}
    for key, value in data.items():
        if key in allowed_fields:
            setattr(exercise_type, key, value)

    db.session.commit()
    return exercise_type

# Delete an exercise type
def delete_exercise_type(exercise_type_id):
    exercise_type = ExerciseType.query.get(exercise_type_id)
    if not exercise_type:
        return False

    # Delete the photo from S3 if it exists
    if exercise_type.photo_url:
        s3.delete_object(Bucket=BUCKET, Key=exercise_type.photo_url.split('/')[-1])

    db.session.delete(exercise_type)
    db.session.commit()
    return True

def upload_photo_to_s3(photo):
    if not photo:
        return None

    filename = secure_filename(photo.filename)
    s3.upload_fileobj(
        photo,
        BUCKET,
        f"exercise_types/{filename}",
        ExtraArgs={'ContentType': photo.content_type}
    )

    print("Uploading to S3 Key:", f"exercise_types/{filename}")

    return f"https://{BUCKET}.s3.amazonaws.com/exercise_types/{filename}"