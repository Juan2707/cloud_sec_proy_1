import databases
import sqlalchemy
from blogapi.config import config

metadata = sqlalchemy.MetaData()

user_table = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("username", sqlalchemy.String),
    sqlalchemy.Column("email", sqlalchemy.String, unique=True),
    sqlalchemy.Column("password", sqlalchemy.String),
)

post_table = sqlalchemy.Table(
    "posts",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("title", sqlalchemy.String),
    sqlalchemy.Column("content", sqlalchemy.String),
    sqlalchemy.Column("author_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id")),
    sqlalchemy.Column("publication_date", sqlalchemy.String),
    sqlalchemy.Column("private", sqlalchemy.Boolean)
)
#TO-DO: Add tag table WITH MANY TO MANY RELATIONSHIP WITH POSTS
#tag_table = sqalchemy.Table()

#TO-DO: Add calification for relation MANY TO MANY RELATIONSHIP WITH POSTS AND USERS


engine = sqlalchemy.create_engine(config.DATABASE_URL, connect_args={"check_same_thread": False})

metadata.create_all(engine)
database = databases.Database(config.DATABASE_URL, force_rollback=config.DB_FORCE_ROLL_BACK)