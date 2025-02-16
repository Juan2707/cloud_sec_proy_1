from fastapi import APIRouter, HTTPException, Depends
from blogapi.models.user import LoginUser, UserIn
from blogapi.security import get_user, get_password_hash, authenticate_user, create_access_token
from blogapi.database import database, user_table
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
import bleach

router = APIRouter()

@router.post("/user", status_code=201)
async def register(user: UserIn):
    user.username = bleach.clean(user.username)
    #No necesario en contraseñas y correos por la validación de campos en el modelo
    if await get_user(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    query = user_table.insert().values(email=user.email, username=user.username, password=hashed_password)

    await database.execute(query)
    return {"detail": "User created"}

@router.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await authenticate_user(form_data.username, form_data.password)
    #print para ver que username y password llega

    access_token = create_access_token(user.email)
    return {"access_token": access_token, "token_type": "bearer"}
