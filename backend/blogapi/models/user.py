from pydantic import BaseModel
#import model post
from .post import UserPost

class User(BaseModel):
    id: int | None = None
    username: str

class UserIn(User):
    email: str
    password: str

class UserWithPosts(BaseModel):
    user: User
    posts: list[UserPost]

class LoginUser(BaseModel):
    email: str
    password: str