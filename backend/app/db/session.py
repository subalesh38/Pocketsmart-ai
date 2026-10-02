from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings
import re

class Base(DeclarativeBase):
    pass

url = settings.DATABASE_URL
if url.startswith("postgres://") or url.startswith("postgresql://"):
    url = re.sub(r"^postgres(ql)?://", "postgresql+psycopg://", url)

connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}

engine = create_engine(url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
