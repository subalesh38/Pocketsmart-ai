from typing import Generator
from app.db.session import SessionLocal

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from fastapi import Request, Depends
from app.core.security import decode_access_token
from app.core.errors import AppError
from app.models.user import User

def get_current_user(request: Request, db = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise AppError(code="UNAUTHORIZED", message="Not authenticated", status_code=401)
    
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise AppError(code="UNAUTHORIZED", message="Invalid or expired token", status_code=401)
    
    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AppError(code="UNAUTHORIZED", message="User not found", status_code=401)
    
    return user
