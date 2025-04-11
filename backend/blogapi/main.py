# Import relevantes para la creación de la aplicación FastAPI
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import de la definición de la base de datos
from blogapi.database import database, create_tables

# Import de los routers
from blogapi.routers.post import router as post_router
from blogapi.routers.user import router as user_router

# Lista de orígenes permitidos para CORS (ajustar según entorno)
origins = [

    # Revisar cuando se suba a CLoud
    "http://34.134.224.247:3000"

]

# Context manager para manejar el ciclo de vida de la aplicación
@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    await create_tables()  # <<--- NUEVA LÍNEA: creación de tablas asincrónica
    yield
    await database.disconnect()

# Crear instancia de la aplicación
app = FastAPI(lifespan=lifespan)

# Routers
app.include_router(post_router)
app.include_router(user_router)

# Middleware para CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
