#Import relevantes para la creación de la aplicación FastAPI
from contextlib import asynccontextmanager #Context manager para manejar el ciclo de vida de la aplicación
from fastapi import FastAPI #Clase principal de FastAPI
from fastapi.middleware.cors import CORSMiddleware #Middleware para manejar CORS

#Import de la definición de la base de datos
from blogapi.database import database #Import de la base de datos para manejar la conexión y desconexión

#Import de los routers segmentados para mayor facilidad de mantenimiento y debugging
from blogapi.routers.post import router as post_router #Import del router que maneja rutas de acciones sobre posts y sus subcaracterísticas
from blogapi.routers.user import router as user_router #Import del router que maneja rutas de acciones sobre usuarios

"""
Lista e origenes permitos para conectarse con la API
Debe añadirse o modificarse al momento del despliegue Cloud.

"""
origins = [
    "http://localhost:3000" #Origen permitido para el desarrollo local
]

"""
Context manager para manejar el ciclo de vida de la aplicación
Se encarga de conectar y desconectar la base de datos
:params: app: FastAPI
:return: None
"""
@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

# Creación de la aplicación FastAPI
app = FastAPI(lifespan=lifespan)

#Inclusión de los routers en la aplicación
app.include_router(post_router) #Inclusión del router de posts
app.include_router(user_router) #Inclusión del router de usuarios

"""
Middlware para manejar CORS y evitar bloqueo de trafico entre frontend y backend. 
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)