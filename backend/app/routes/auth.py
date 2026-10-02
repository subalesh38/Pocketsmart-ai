from fastapi import APIRouter, Depends, Response
from typing import cast
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.schemas.auth import UserRegister, UserLogin, UserResponse
from app.services.auth import register_user, authenticate_user
from app.core.security import create_access_token
from app.core.config import settings
from app.models.user import User
from app.core.rate_limit import rate_limit_auth

router = APIRouter()

@router.post("/register", response_model=UserResponse, dependencies=[Depends(rate_limit_auth)])
def register(data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, data)
    return user

@router.post("/login", response_model=UserResponse, dependencies=[Depends(rate_limit_auth)])
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, data)
    access_token = create_access_token(cast(int, user.id))
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    return {"detail": "Logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
