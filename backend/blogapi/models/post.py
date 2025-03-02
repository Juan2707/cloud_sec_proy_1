from pydantic import BaseModel, validator
from typing import Optional, List
import bleach

class UserPostIn(BaseModel):
    """
    Modelo de entrada de un post de usuario, incluye título, contenido y si es privado o no, existe por facilidades de desarrollo y formato
    """
    title: str 
    content: str
    private: bool

    #Validación de campos de entrada para prevención de inyección de código
    @validator('title', 'content')
    def clean_html(cls, v):
        return bleach.clean(v)

    
class UserPost(UserPostIn):
    """
    Modelo de post de usuario, incluye los parametros de UserPostIn tambien.
    """
    id: int
    author_id: float
    publication_date: str
    avg_calification: float
    amount_califications: int
    class Config:
        from_attributes = True

class UserPostWithMyCalification(UserPost):
    """
    Modelo de post con adicional de calificación del usuario, incluye los parametros de UserPost y la calificación del usuario
    """
    my_calification: Optional[float]
    class Config:
        from_attributes = True


class CalificationPostIn(BaseModel):
    """
    Modelo de entrada de calificación de post, incluye la calificación y el id del post, existe por facilidades de desarrollo y formato"""
    post_id: int
    calification: float

    #Validación de campos de entrada para prevención de inyección de código
    @validator('calification')
    def validate_calification(cls, v):
        if v < 0 or v > 5:
            raise ValueError('Calification must be between 0 and 5')
        return v

class CalificationPost(CalificationPostIn):
    """
    Modelo de calificación de post, incluye los parametros de CalificationPostIn tambien.
    """
    id: int
    user_id: int
    class Config:
        from_attributes = True

class TagIn(BaseModel):
    """
    Modelo de entrada de tag, incluye el nombre del tag, existe por facilidades de desarrollo y formato
    """
    name: str

class Tag(TagIn):
    """
    Modelo de tag, incluye los parametros de TagIn tambien.
    """
    id: int
    class Config:
        from_attributes = True

class TagPostIn(BaseModel):
    """
    Modelo de entrada de tag de post, incluye el id del post y el id del tag, existe por facilidades de desarrollo y formato
    """
    post_id: int
    tag_id: int

class TagPost(TagPostIn):
    """
    Modelo de tag de post, incluye los parametros de TagPostIn tambien.
    """
    id: int
    class Config:
        from_attributes = True

class CalificationIn(BaseModel):
    """
    Modelo de entrada de calificación, incluye la calificación y el id del usuario, existe por facilidades de desarrollo y formato
    """
    calification: float
    post_id: int

class PostQuery(BaseModel):
    """
    Modelo de query de post, incluye los parametros de búsqueda de post, existe por necesidad de peticiones específicas
    """
    tag_ids: List[int]