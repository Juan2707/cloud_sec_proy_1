import datetime
from typing import Annotated
from jose import jwt, ExpiredSignatureError, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from blogapi.database import database, user_table #Import de la base de datos y la tabla de usuarios

"""
Declaración de variables y funciones para manejar la seguridad de la API
"""
SECRET_KEY = "d8e1a4b0b5e2f9a9c8a7c6b5d4e3f2a1" #Llave secreta para encriptación de tokens
ALGORITHM = "HS256" #Algoritmo de encriptación de tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") #Esquema de autenticación OAuth2
pwd_context = CryptContext(schemes=["bcrypt"]) #Contexto de encriptación de contraseñas
"""
Excepción para manejar errores de autenticación.
"""
credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})

def access_token_expire_minutes() -> int:
    """
    Retorna el tiempo de expiración del token en minutos (30 minutos)
    :params: None
    :return: int
    """
    return 30

def create_access_token(email: str):
    """
    Crea un token de acceso para el usuario
    :params: email: str
    :return: str
    """
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=access_token_expire_minutes()) #Tiempo de expiración del token
    jwt_data = {"sub": email, "exp": expire} #Datos del token
    encoded_jwt = jwt.encode(jwt_data, SECRET_KEY, algorithm=ALGORITHM) #Encriptación del token
    return encoded_jwt

def get_password_hash(password: str) -> str:
    """
    Encripta la contraseña del usuario
    :params: password: str
    :return: str
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password:str) -> bool:
    """
    Verifica que la contraseña encriptada coincida con la contraseña en texto plano
    :params: plain_password: str, hashed_password: str
    :return: bool
    """
    return pwd_context.verify(plain_password, hashed_password)

async def get_user(email: str):
    """
    Obtiene un usuario por su email
    :params: email: str
    :return: dict
    """
    query = user_table.select().where(user_table.c.email == email) #Query para obtener el usuario de la tabla de usuarios
    result = await database.fetch_one(query)
    if result: 
        return result

async def authenticate_user(email: str, password: str):
    """
    Autentica al usuario por su email y contraseña
    :params: email: str, password: str
    :return: dict
    """
    user = await get_user(email)
    if not user:
        raise credentials_exception
    if not verify_password(password, user["password"]):
        raise credentials_exception
    return user

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Obtiene el usuario actual a partir del token
    :params: token: str
    :return: dict
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) #Decodifica el token
        email = payload.get("sub") #Obtiene el email del token
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
