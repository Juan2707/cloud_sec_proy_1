import databases
import sqlalchemy
from blogapi.config import config

# Creación de la base de datos
# Se crean las tablas necesarias para el funcionamiento de la aplicación
metadata = sqlalchemy.MetaData()

# Tabla de usuarios
user_table = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),#Llave primaria de la tabla
    sqlalchemy.Column("username", sqlalchemy.String),
    sqlalchemy.Column("email", sqlalchemy.String, unique=True),#Se añade la unicidad del email
    sqlalchemy.Column("password", sqlalchemy.String),
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
    sqlalchemy.Column("title", sqlalchemy.String),
    sqlalchemy.Column("content", sqlalchemy.String),
    sqlalchemy.Column("author_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id")),#Llave foranea del sueño del post
    sqlalchemy.Column("publication_date", sqlalchemy.String),
    sqlalchemy.Column("private", sqlalchemy.Boolean),
    sqlalchemy.Column("avg_calification", sqlalchemy.Float),
    sqlalchemy.Column("amount_califications", sqlalchemy.Integer)
)

# Tabla de tags
tag_table = sqlalchemy.Table(
    "tags",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String)
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
#engine = sqlalchemy.create_engine(config.DATABASE_URL, connect_args={"check_same_thread": False})
engine = sqlalchemy.create_engine(config.DATABASE_URL)

# Se crean las tablas en la base de datos
metadata.create_all(engine)
database = databases.Database(config.DATABASE_URL, force_rollback=config.DB_FORCE_ROLL_BACK)
