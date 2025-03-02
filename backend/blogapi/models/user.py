from pydantic import BaseModel, EmailStr, constr
#import model post
from .post import UserPost

class User(BaseModel):
    """
    modelo de usuario base, existe por facilidades de desarrollo y formato
    """
    id: int | None = None
    username: constr(min_length=2, max_length=50) # type: ignore

class UserIn(User):
    """
    modelo de usuario para ingreso, incluye email, contraseña y los atributos de User
    """
    email: EmailStr
    password: constr(min_length=8, max_length=50) # type: ignore

class UserWithPosts(BaseModel):
    """
    modelo de usuario con posts, incluye un usuario y una lista de posts
    """
    user: User
    posts: list[UserPost]

class LoginUser(BaseModel):
    """
    modelo de usuario para autenticación, incluye email y contraseña, existe por facilidades de desarrollo y formato
    """
    email: EmailStr
    password: constr(min_length=8, max_length=50) # type: ignore