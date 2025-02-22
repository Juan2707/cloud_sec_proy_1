from pydantic import BaseModel, validator
from typing import Optional, List
import bleach

class UserPostIn(BaseModel):
    title: str 
    content: str
    private: bool

    @validator('title', 'content')
    def clean_html(cls, v):
        return bleach.clean(v)

    
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

    @validator('calification')
    def validate_calification(cls, v):
        if v < 0 or v > 5:
            raise ValueError('Calification must be between 0 and 5')
        return v

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

class PostQuery(BaseModel):
    tag_ids: List[int]