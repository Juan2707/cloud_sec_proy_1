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
    avg_calification: float
    amount_califications: int
    class Config:
        from_attributes = True

class UserPostWithMyCalification(UserPost):
    my_calification: Optional[float]
    class Config:
        from_attributes = True


class CalificationPostIn(BaseModel):
    post_id: int
    calification: float

class CalificationPost(CalificationPostIn):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class TagIn(BaseModel):
    name: str

class Tag(TagIn):
    id: int
    class Config:
        from_attributes = True

class TagPostIn(BaseModel):
    post_id: int
    tag_id: int

class TagPost(TagPostIn):
    id: int
    class Config:
        from_attributes = True

class CalificationIn(BaseModel):
    calification: float
    post_id: int

