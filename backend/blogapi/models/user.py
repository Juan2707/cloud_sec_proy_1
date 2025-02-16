from pydantic import BaseModel, EmailStr, constr
#import model post
from .post import UserPost

class User(BaseModel):
    id: int | None = None
    username: constr(min_length=2, max_length=50) # type: ignore

class UserIn(User):
    email: EmailStr
    password: constr(min_length=8, max_length=50) # type: ignore

class UserWithPosts(BaseModel):
    user: User
    posts: list[UserPost]

class LoginUser(BaseModel):
    email: EmailStr
    password: constr(min_length=8, max_length=50) # type: ignore