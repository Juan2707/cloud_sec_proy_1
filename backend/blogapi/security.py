import datetime

from typing import Annotated
from jose import jwt, ExpiredSignatureError, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from blogapi.database import database, user_table


#TO-DO: Add a way to get the secret key from the environment
SECRET_KEY = "d8e1a4b0b5e2f9a9c8a7c6b5d4e3f2a1"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"])

credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})

def access_token_expire_minutes() -> int:
    return 30

def crerate_acces_token(email: str):
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=access_token_expire_minutes())
    jwt_data = {"sub": email, "exp": expire}
    encoded_jwt = jwt.encode(jwt_data, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt