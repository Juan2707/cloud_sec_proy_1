from fastapi import APIRouter, HTTPException, Depends
from blogapi.models.user import LoginUser, UserIn, User #Importamos los modelos de usuario
from blogapi.security import get_user, get_password_hash, authenticate_user, create_access_token, get_current_user #Importamos las funciones que necesitamos
from blogapi.database import database, user_table #Importamos la base de datos y la tabla de usuarios
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
import bleach

#Creamos el router
router = APIRouter()



@router.post("/user", status_code=201)
async def register(user: UserIn):
    """
    Registrar un nuevo usuario
    """
    user.username = bleach.clean(user.username) #Limpiamos el username de caracteres especiales
    #No necesario en contraseñas y correos por la validación de campos en el modelo
    if await get_user(user.email): 
        raise HTTPException(status_code=400, detail="Email already registered") #Validamos que el email no esté registrado
    hashed_password = get_password_hash(user.password) #Obtenemos el hash de la contraseña
    query = user_table.insert().values(email=user.email, username=user.username, password=hashed_password) #Insertamos el usuario en la base de datos

    await database.execute(query)
    return {"detail": "User created"}

@router.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]): #Cambiamos el tipo de form_data a OAuth2PasswordRequestForm, esto realiza autenticación
    """
    Autenticar un usuario
    :param form_data: OAuth2PasswordRequestForm
    :return: dict
    """
    user = await authenticate_user(form_data.username, form_data.password) # Cambiamos el tipo de form_data a form_data.username y form_data.password
    #print para ver que username y password llega

    access_token = create_access_token(user.email)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/user/{author_id}", response_model=User)
async def get_user_by_id(author_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtener un usuario por su ID
    :param author_id: int
    :return: dict
    """
    query = user_table.select().where(user_table.c.id == author_id) #Seleccionamos el usuario por su ID
    user = await database.fetch_one(query)
    if user:
        return {"id": user["id"], "username": user["username"]}
    else:
        raise HTTPException(status_code=404, detail="User not found")

@router.get("/myuser", response_model=User)
async def get_current_user_route(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtener el usuario actual
    :return: dict
    """
    return {"id": current_user.id, "username": current_user.username}
