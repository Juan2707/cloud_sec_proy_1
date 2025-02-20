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

def create_access_token(email: str):
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=access_token_expire_minutes())
    jwt_data = {"sub": email, "exp": expire}
    encoded_jwt = jwt.encode(jwt_data, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password:str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def get_user(email: str):
    query = user_table.select().where(user_table.c.email == email)
    result = await database.fetch_one(query)
    if result: 
        return result

async def authenticate_user(email: str, password: str):
    user = await get_user(email)
    if not user:
        raise credentials_exception
    if not verify_password(password, user["password"]):
        raise credentials_exception
    return user

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except ExpiredSignatureError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired", headers={"WWW-Authenticate": "Bearer"}) from e
    except JWTError as e:
        raise credentials_exception from e
    user = await get_user(email)
    if user is None:
        raise credentials_exception
    return user
