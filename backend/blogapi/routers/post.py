from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Annotated, List
from datetime import datetime
from blogapi.database import post_table, database, calification_table, tag_table, post_tag_table, user_table
from blogapi.models.post import UserPost, UserPostIn, CalificationPost, CalificationPostIn, UserPostWithMyCalification, Tag, TagPost, TagIn, TagPostIn, PostQuery
from blogapi.models.user import User, UserWithPosts
from blogapi.security import get_current_user
from sqlalchemy import select, func

router = APIRouter()


async def check_if_tag_exists(tag_name: str):
    """
    Verifica si una etiqueta ya existe en la base de datos
    :param tag_name: str
    :return: bool
    """
    query = tag_table.select().where(tag_table.c.name == tag_name)
    return await database.fetch_one(query)

async def get_calification_by_user(post_id: int, user_id: int):
    """
    Obtiene la calificación de un usuario en un post
    :param post_id: int
    :param user_id: int
    :return"""
    query = calification_table.select().where(
        calification_table.c.post_id == post_id,
        calification_table.c.user_id == user_id
    )
    record = await database.fetch_one(query)
    if record:
        my_calification = record["calification"]
        return float(my_calification) if my_calification is not None else None
    return None

async def find_post(post_id: int):
    """
    Encuentra un post por su ID
    :param post_id: int
    :return
    """
    query = post_table.select().where(post_table.c.id == post_id)
    return await database.fetch_one(query)

async def verify_post_owner(post_id: int, current_user: User):
    """
    Verifica si el usuario actual es el dueño del post
    :param post_id: int
    :param current_user: User
    :return
    """
    post = await find_post(post_id)
    if post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    return post


#IMPORTANTE: Todos los posts con current_user: Annotated[User, Depends(get_current_user)] son privados y 
# solo pueden ser accedidos por usuarios legitimos y en sus respectivos casos de privacidad solo por sus usuarios dueños.
@router.get("/post/{post_id}/calification", response_model=UserPostWithMyCalification)
async def get_post_califications(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene las calificaciones de un post
    :param post_id: int
    :param current_user: User
    :return
    """
    post = await find_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["private"] and post["author_id"] != current_user.id: #Garantia de privacidad y seguridad
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    my_calification = await get_calification_by_user(post_id, current_user.id)
    if not my_calification:
        my_calification = None
    return {**post, "my_calification": my_calification}

@router.post("/post",response_model=UserPost, status_code=201)
async def create_post(post: UserPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Crea un nuevo post
    :param post: UserPostIn
    :param current_user: User
    :return
    """
    data = {**post.dict(), "author_id": current_user.id, "publication_date": datetime.now().isoformat(), "avg_calification": 0, "amount_califications": 0}
    query = post_table.insert().values(data)
    last_record_id = await database.execute(query)
    return {**data, "id": last_record_id}

@router.get("/post", response_model= list[UserPost])
async def get_all_posts(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene todos los posts
    Este endpoint no es usado durante la ejecución, pero se tiene como referencia
    :param current_user: User
    :return
    """
    query = post_table.select()
    return await database.fetch_all(query)

#get all public posts
@router.get("/post/public", response_model= list[UserPost])
async def get_all_public_posts(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene todos los posts públicos
    No existe un endpoint para obtener todos los posts privados ya que no es necesario
    :param current_user: User
    :return
    """
    query = post_table.select().where(post_table.c.private == False)
    return await database.fetch_all(query)


@router.get("/post/user/{author_id}/posts", response_model= UserWithPosts)
async def get_user_with_posts(author_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene un usuario con sus posts
    :param author_id: str
    :param current_user: User
    :return"""
    if author_id == f"{current_user.id}": #Si el usuario es el mismo que el actual no se filtra por privacidad
        query = post_table.select().where(post_table.c.author_id == author_id)
        posts = await database.fetch_all(query)
        print(posts)
        data = {"user":current_user,
                "posts": posts}
        return data
    else: #Si el usuario no es el mismo que el actual se filtra por privacidad y se garantiza que no se esta exponiendo información
        query = user_table.select().where(user_table.c.id == author_id)
        user = await database.fetch_one(query)
        data = {"user":user,
                "posts": await database.fetch_all(post_table.select().where(post_table.c.author_id == author_id, post_table.c.private == False))}
        return data


@router.get("/post/{post_id}", response_model=UserPost)
async def get_post(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene un post por su ID
    :param post_id: int
    :param current_user: User
    :return
    """
    post = await find_post(post_id)
    if post["private"] and post["author_id"] != current_user.id: #Seguridad ante el intento de accesos forzados a posts privados
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    return post

@router.patch("/post/{post_id}", response_model=UserPost)
async def update_post(post_id: int, post: UserPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Actualiza un post
    :param post_id: int
    :param post: UserPostIn
    :param current_user: User
    :return
    """
    await verify_post_owner(post_id, current_user) #Verificar que el usuario es el dueño del post por Seguridad
    update_data = post.dict(exclude_unset=True)
    query = post_table.update().where(post_table.c.id == post_id).values(**update_data)
    await database.execute(query)
    return await find_post(post_id)

@router.delete("/post/{post_id}")
async def delete_post(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Elimina un post
    :param post_id: int
    :param current_user: User
    :return
    """
    await verify_post_owner(post_id, current_user) #Verificar que el usuario es el dueño del post por Seguridad
    query = post_table.delete().where(post_table.c.id == post_id)
    await database.execute(query)
    #Tambien se deben borrar las calificaciones
    query = calification_table.delete().where(calification_table.c.post_id == post_id)
    await database.execute(query)
    #Tambien se deben borrar las etiquetas
    query = post_tag_table.delete().where(post_tag_table.c.post_id == post_id)
    await database.execute(query)
    return {"message": "Post deleted successfully"}

#make post public
@router.patch("/post/{post_id}/public")
async def make_post_public(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Hace un post público
    :param post_id: int
    :param current_user: User
    :return
    """
    await verify_post_owner(post_id, current_user) #Acción solo posible para el dueño del post
    query = post_table.update().where(post_table.c.id == post_id).values(private=False)
    await database.execute(query)
    return {"message": "Post is now public"}

#make post private
@router.patch("/post/{post_id}/private")
async def make_post_private(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Hace un post privado
    :param post_id: int
    :param current_user: User
    :return
    """
    await verify_post_owner(post_id, current_user) #Acción solo posible para el dueño del post
    query = post_table.update().where(post_table.c.id == post_id).values(private=True)
    await database.execute(query)
    return {"message": "Post is now private"}

@router.post("/calificate", response_model=CalificationPost, status_code=201)
async def calificate_post(calification: CalificationPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Califica un post
    :param calification: CalificationPostIn
    :param current_user: User
    :return
    """
    post = await find_post(calification.post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["private"] and post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post") #Seguridad ante el intento de calificar posts privados
    #verificar que el usuario no haya calificado antes
    my_calification = await get_calification_by_user(calification.post_id, current_user.id)
    if my_calification:
        raise HTTPException(status_code=400, detail="You have already rated this post") #Para esto ya existe el metodo update y se tiene en cuenta en el desarrollo front
    data = {**calification.dict(), "user_id": current_user.id}
    query = calification_table.insert().values(data)
    last_record_id = await database.execute(query)
    #actualizar el promedio de calificaciones en la tabla post_table usando avg_calification, amount_califications y calification.calification
    query = post_table.update().where(post_table.c.id == calification.post_id).values(
        avg_calification = (post["avg_calification"] * post["amount_califications"] + calification.calification) / (post["amount_califications"] + 1),
        amount_califications = post["amount_califications"] + 1
    )
    await database.execute(query)
    return {**data, "id": last_record_id}

#editar calificacion
@router.patch("/calificate/{calification_id}", response_model=CalificationPost)
async def update_calification(calification_id: int, calification: CalificationPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Actualiza una calificación
    :param calification_id: int
    :param calification: CalificationPostIn"""
    #obtener vieja calificacion
    query = calification_table.select().where(calification_table.c.id == calification_id)
    old_calification = await database.fetch_one(query)
    #Check if the user is the owner of the calification
    if old_calification["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this calification") #Seguridad ante el intento de modificar calificaciones ajenas
    query = post_table.select().where(post_table.c.id == calification.post_id)
    post = await database.fetch_one(query)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["private"] and post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post") #Seguridad ante el intento de modificar calificaciones de posts privados
    query = calification_table.update().where(calification_table.c.id == calification_id).values(calification.dict(exclude_unset=True))
    await database.execute(query)
    #actualizar el promedio de calificaciones en la tabla post_table usando avg_calification, amount_califications y calification.calification
    query = post_table.update().where(post_table.c.id == calification.post_id).values(
        avg_calification = ((post["avg_calification"] * post["amount_califications"]) - old_calification["calification"] + calification.calification) / post["amount_califications"],
    )
    await database.execute(query)
    query = calification_table.select().where(calification_table.c.id == calification_id)
    return await database.fetch_one(query)

#eliminar calificación de un post
@router.delete("/calificate/{calification_id}")
async def delete_calification(calification_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Elimina una calificación
    :param calification_id: int
    :param current_user: User
    :return
    """
    query = calification_table.select().where(calification_table.c.id == calification_id)
    calification = await database.fetch_one(query)
    if not calification:
        raise HTTPException(status_code=404, detail="Calification not found")
    #Check if the user is the owner of the calification
    if calification["user_id"] != current_user.id: #Seguridad ante el intento de eliminar calificaciones ajenas
        raise HTTPException(status_code=403, detail="You don't have permission to access this calification")
    #recalcular el promedio de calificaciones en la tabla post_table usando avg_calification, amount_califications y calification.calification
    post = await find_post(calification["post_id"])
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    query = post_table.update().where(post_table.c.id == calification["post_id"]).values(
        avg_calification = (post["avg_calification"] * post["amount_califications"] - calification["calification"]) / (post["amount_califications"] - 1),
        amount_califications = post["amount_califications"] - 1
    )
    await database.execute(query)
    query = calification_table.delete().where(calification_table.c.id == calification_id).where(calification_table.c.user_id == current_user.id)
    await database.execute(query)
    return {"message": "Calification deleted successfully"}

#get my califications in a specific post
@router.get("/calificate/{post_id}", response_model=list[CalificationPost])
async def get_my_califications(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene mis calificaciones en un post
    :param post_id: int
    :param current_user: User
    :return
    """
    query = calification_table.select().where(calification_table.c.post_id == post_id, calification_table.c.user_id == current_user.id)
    return await database.fetch_all(query)

#crear etiqueta
@router.post("/tag", response_model=Tag, status_code=201)
async def create_tag(tag: TagIn,  current_user: Annotated[User, Depends(get_current_user)]):
    """
    Crea una nueva etiqueta
    :param tag: TagIn
    :param current_user: User
    :return
    """
    if await check_if_tag_exists(tag.name):
        raise HTTPException(status_code=400, detail="Tag already exists")
    query = tag_table.insert().values(tag.dict())
    last_record_id = await database.execute(query)
    return {**tag.dict(), "id": last_record_id}

#obtener todas las etiquetas
@router.get("/tags", response_model=list[Tag])
async def get_all_tags( current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene todas las etiquetas
    :param current_user: User
    :return
    """
    query = tag_table.select()
    return await database.fetch_all(query)

#obtener etiqueta por id
@router.get("/tag/{tag_id}", response_model=Tag)
async def get_tag(tag_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene una etiqueta por su ID
    :param tag_id: int
    :param current_user: User
    :return
    """
    query = tag_table.select().where(tag_table.c.id == tag_id)
    return await database.fetch_one(query)

#asingar etiqueta a un post
@router.post("/tag/post", response_model=TagPost, status_code=201)
async def create_tag_post(tag_post: TagPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Asigna una etiqueta a un post
    :param tag_post: TagPostIn
    :param current_user: User
    :return
    """
    await verify_post_owner(tag_post.post_id, current_user)#Verificar que el usuario es el dueño del post por Seguridad al crear la relación 
    #verificar que la etiqueta exista
    query = post_tag_table.select().where(post_tag_table.c.tag_id == tag_post.tag_id, post_tag_table.c.post_id == tag_post.post_id)
    record = await database.fetch_one(query)
    if record:
        raise HTTPException(status_code=400, detail="Tag already assigned to post")
    query = post_tag_table.insert().values(tag_post.dict())
    last_record_id = await database.execute(query)
    return {**tag_post.dict(), "id": last_record_id}

@router.delete("/tag/{tag_id}/post/{post_id}")
async def delete_tag_post(tag_id: int, post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Elimina una etiqueta de un post
    :param tag_id: int
    :param post_id: int
    :param current_user: User
    :return
    """
    await verify_post_owner(post_id, current_user)#Verificar que el usuario es el dueño del post por Seguridad al eliminar la relación
    #verificar que la etiqueta exista
    query = post_tag_table.select().where(post_tag_table.c.tag_id == tag_id, post_tag_table.c.post_id == post_id)
    tag_post = await database.fetch_one(query)
    if not tag_post:
        raise HTTPException(status_code=404, detail="Tag not found")
    query = post_tag_table.delete().where(post_tag_table.c.tag_id == tag_id, post_tag_table.c.post_id == post_id)
    await database.execute(query)
    return {"message": "Tag deleted successfully"}

#obtener todas las etiquetas de un post
@router.get("/tag/post/{post_id}", response_model=list[Tag])
async def get_post_tags(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene todas las etiquetas de un post
    :param post_id: int
    :param current_user: User
    :return
    """
    post = await find_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["private"] and post["author_id"] != current_user.id: #Seguridad ante el intento de acceder a etiquetas de posts privados
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    query = tag_table.join(post_tag_table).select().where(post_tag_table.c.post_id == post_id)
    return await database.fetch_all(query)

@router.get("/post/tag/{tag_id}", response_model=list[UserPost])
async def get_post_by_tag(tag_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene todos los posts por una etiqueta
    :param tag_id: int
    :param current_user: User
    :return
    """
    #Ademas la query debe filtrar los post privados
    query = post_table.join(post_tag_table).select().where(post_tag_table.c.tag_id == tag_id, post_table.c.private == False)
    return await database.fetch_all(query)

@router.post("/posts/by-tags", response_model=list[UserPost])
async def get_posts_by_tags(query: PostQuery, current_user: User = Depends(get_current_user)):
    """
    Obtiene todos los posts por una lista de etiquetas
    :param query: PostQuery
    :param current_user: User
    :return
    """
    if not query.tag_ids:
        raise HTTPException(status_code=400, detail="Tag IDs list cannot be empty") #Validación de la lista de tags, se tiene en cuenta en frontend
    
    query_statement = select(post_table).select_from(
    post_table.join(post_tag_table, post_table.c.id == post_tag_table.c.post_id)
).where(
    post_tag_table.c.tag_id.in_(query.tag_ids),  # Aquí usamos 'in_' para múltiples tags
    post_table.c.private == False
)
    
    posts = await database.fetch_all(query_statement)
    return posts

#get user post by tagss
@router.post("/user/{author_id}/posts/by-tags", response_model=list[UserPost])
async def get_user_post_by_tags(author_id: str, query: PostQuery, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene todos los posts de un usuario por una lista de etiquetas, es un POST ya que se requiere un body con la lista de tags
    :param author_id: str
    :param query: PostQuery
    :param current_user: User
    :return
    """
    data = {}
    if author_id == f"{current_user.id}": #Si el usuario dueño es el mismo que el actual no se filtra por privacidad
        query_statement = select(post_table).select_from(
            post_table.join(post_tag_table, post_table.c.id == post_tag_table.c.post_id)
        ).where(
            (post_tag_table.c.tag_id.in_(query.tag_ids)) & (post_table.c.author_id == author_id)
        )
        data = await database.fetch_all(query_statement)
    else:
        query1 = user_table.select().where(user_table.c.id == author_id)
        user = await database.fetch_one(query1)
        query_statement = select(post_table).select_from(
            post_table.join(post_tag_table, post_table.c.id == post_tag_table.c.post_id)
        ).where(
            (post_tag_table.c.tag_id.in_(query.tag_ids)) & (post_table.c.author_id == author_id) & (post_table.c.private == False)
        )
        data = await database.fetch_all(query_statement)
    return data


#get user posts by tag
@router.get("/user/{author_id}/posts/tag/{tag_id}", response_model=UserWithPosts)
async def get_user_posts_by_tag(author_id: str, tag_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Obtiene todos los posts de un usuario por una etiqueta
    :param author_id: str
    :param tag_id: int
    :param current_user: User
    :return
    """
    data = {}
    if author_id == f"{current_user.id}": #Si el usuario dueño es el mismo que el actual no se filtra por privacidad
        data = {"user":current_user,
                "posts": await database.fetch_all(post_table.join(post_tag_table).select().where(post_tag_table.c.tag_id == tag_id, post_table.c.author_id == author_id))}
    else:
        query = user_table.select().where(user_table.c.id == author_id)
        user = await database.fetch_one(query)
        data = {"user":user,
                "posts": await database.fetch_all(post_table.join(post_tag_table).select().where(post_tag_table.c.tag_id == tag_id, post_table.c.author_id == author_id, post_table.c.private == False))}
    return data