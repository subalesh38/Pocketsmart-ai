from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.repository import create_user, get_user_by_username
from app.schemas.auth import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password
from app.core.errors import AppError
from app.models.user import User

def register_user(db: Session, data: UserRegister) -> User:
    try:
        user = create_user(
            db=db,
            username=data.username,
            email=data.email,
            password_hash=get_password_hash(data.password)
        )
        return user
    except IntegrityError:
        db.rollback()
        raise AppError(code="USER_ALREADY_EXISTS", message="Username or email already in use", status_code=409)

def authenticate_user(db: Session, data: UserLogin) -> User:
    user = get_user_by_username(db, data.username)
    if not user:
        raise AppError(code="INVALID_CREDENTIALS", message="Incorrect username or password", status_code=401)
    if not verify_password(data.password, str(user.password_hash)):
        raise AppError(code="INVALID_CREDENTIALS", message="Incorrect username or password", status_code=401)
    return user
