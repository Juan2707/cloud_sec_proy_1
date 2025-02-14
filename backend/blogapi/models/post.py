from pydantic import BaseModel
from typing import Optional

class UserPostIn(BaseModel):
    title: str 
    content: str
    private: bool
    
class UserPost(UserPostIn):
    id: int
    author_id: float
    publication_date: str
    class Config:
        from_attributes = True




#TO-DO: Add tag table WITH MANY TO MANY RELATIONSHIP WITH POSTS

