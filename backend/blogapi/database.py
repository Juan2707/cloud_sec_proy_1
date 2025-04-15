from databases import Database
from sqlalchemy.ext.asyncio import create_async_engine
import sqlalchemy
from blogapi.config import config
import os
import json
from google.cloud import secretmanager
from dotenv import load_dotenv

# Creación de la base de datos
# Se crean las tablas necesarias para el funcionamiento de la aplicación
metadata = sqlalchemy.MetaData()

# Tabla de usuarios
user_table = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),#Llave primaria de la tabla
    sqlalchemy.Column("username", sqlalchemy.String(length=255)),
    sqlalchemy.Column("email", sqlalchemy.String(length=255), unique=True),#Se añade la unicidad del email
    sqlalchemy.Column("password", sqlalchemy.String(length=255)),
)
# Tabla de calificaciones que sirve de puente muchos a muchos entre usuarios y posts
calification_table = sqlalchemy.Table(
    "califications",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),#Llae primaria de la tabla
    sqlalchemy.Column("user_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"), nullable=False),#Llave foranea de la tabla usuarios
    sqlalchemy.Column("post_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("posts.id"), nullable=False),#Llave foranea de la tabla posts
    sqlalchemy.Column("calification", sqlalchemy.Float)
)

# Tabla de posts
post_table = sqlalchemy.Table(
    "posts",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("title", sqlalchemy.String(length=255)),
    sqlalchemy.Column("content", sqlalchemy.String(length=255)),
    sqlalchemy.Column("author_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id")),#Llave foranea del sueño del post
    sqlalchemy.Column("publication_date", sqlalchemy.String(length=255)),
    sqlalchemy.Column("private", sqlalchemy.Boolean),
    sqlalchemy.Column("avg_calification", sqlalchemy.Float),
    sqlalchemy.Column("amount_califications", sqlalchemy.Integer)
)

# Tabla de tags
tag_table = sqlalchemy.Table(
    "tags",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String(length=255))
)
# Tabla de muchos a muchos entre posts y tags
post_tag_table = sqlalchemy.Table(
    "post_tags",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column( "post_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("posts.id")),
    sqlalchemy.Column("tag_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("tags.id"))
)

# Creación de la conexión a la base de datos
# Se crea la conexión a la base de datos con la URL definida en el archivo de configuración

# Cargar el archivo .env
load_dotenv()

def get_secret_payload(secret_id: str, project_id: str):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    payload = response.payload.data.decode("UTF-8")
    return json.loads(payload)

# Leer valores desde .env
PROJECT_ID = os.getenv("GCP_PROJECT_ID")
FORCE_ROLLBACK = os.getenv("FORCE_ROLLBACK", "false").lower() == "true"

# Leer secreto desde Secret Manager
secret = get_secret_payload("db-credentials", PROJECT_ID)

# Construir DATABASE_URL para MySQL + aiomysql
DATABASE_URL = (
    f"mysql+aiomysql://{secret['username']}:{secret['password']}"
    f"@{secret['host']}:3306/{secret['database']}"
)

# Motor de base de datos asincrónico
#DATABASE_URL = config.DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=True)

# Database para queries asincrónicas con la librería `databases`
database = Database(DATABASE_URL, force_rollback=config.DB_FORCE_ROLL_BACK)

# Función para crear las tablas
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(metadata.create_all)

