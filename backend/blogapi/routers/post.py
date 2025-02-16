from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Annotated
from datetime import datetime
from blogapi.database import post_table, database, calification_table, tag_table, post_tag_table
from blogapi.models.post import UserPost, UserPostIn, CalificationPost, CalificationPostIn, UserPostWithCalificationAndMyCalification, Tag, TagPost, TagIn, TagPostIn
from blogapi.models.user import User, UserWithPosts
from blogapi.security import get_current_user
from sqlalchemy import select, func

router = APIRouter()


async def get_avarage_calification(post_id: int):
    query = select(func.avg(calification_table.c.calification).label('average_calification')).where(calification_table.c.post_id == post_id)
    return await database.fetch_val(query)

async def get_calification_by_user(post_id: int, user_id: int):
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
    query = post_table.select().where(post_table.c.id == post_id)
    return await database.fetch_one(query)

async def verify_post_owner(post_id: int, current_user: User):
    post = await find_post(post_id)
    if post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    return post

@router.get("/post/{post_id}/calification", response_model=UserPostWithCalificationAndMyCalification)
async def get_post_califications(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    post = await find_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    calification = await get_avarage_calification(post_id)
    my_calification = await get_calification_by_user(post_id, current_user.id)
    if not my_calification:
        my_calification = None
    return {**post, "calification": calification, "my_calification": my_calification}

@router.post("/post",response_model=UserPost, status_code=201)
async def create_post(post: UserPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    data = {**post.dict(), "author_id": current_user.id, "publication_date": datetime.now().isoformat()}
    query = post_table.insert().values(data)
    last_record_id = await database.execute(query)
    return {**data, "id": last_record_id}

@router.get("/post", response_model= list[UserPost])
async def get_all_posts():
    query = post_table.select()
    return await database.fetch_all(query)

@router.get("/user/{author_id}/posts", response_model=list[UserPost])
async def get_user_posts(author_id: str):
    query = post_table.select().where(post_table.c.author_id == author_id)
    return await database.fetch_all(query)

@router.get("/post/user/posts", response_model= UserWithPosts)
async def get_user_with_posts(current_user: Annotated[User, Depends(get_current_user)]):
    return {"user":current_user,
            "posts": await get_user_posts(current_user.id)}

@router.get("/post/{post_id}", response_model=UserPost)
async def get_post(post_id: int):
    return await find_post(post_id)

@router.patch("/post/{post_id}", response_model=UserPost)
async def update_post(post_id: int, post: UserPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    await verify_post_owner(post_id, current_user)
    update_data = post.dict(exclude_unset=True)
    query = post_table.update().where(post_table.c.id == post_id).values(**update_data)
    await database.execute(query)
    return await find_post(post_id)

@router.delete("/post/{post_id}")
async def delete_post(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    await verify_post_owner(post_id, current_user)
    query = post_table.delete().where(post_table.c.id == post_id)
    await database.execute(query)
    #Tambien se deben borrar las calificaciones
    query = calification_table.delete().where(calification_table.c.post_id == post_id)
    await database.execute(query)
    #Tambien se deben borrar las etiquetas
    query = post_tag_table.delete().where(post_tag_table.c.post_id == post_id)
    await database.execute(query)
    return {"message": "Post deleted successfully"}

@router.post("/calificate", response_model=CalificationPost, status_code=201)
async def calificate_post(calification: CalificationPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    post = await find_post(calification.post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    #verificar que el usuario no haya calificado antes
    my_calification = await get_calification_by_user(calification.post_id, current_user.id)
    if my_calification:
        raise HTTPException(status_code=400, detail="You have already rated this post")
    data = {**calification.dict(), "user_id": current_user.id}
    query = calification_table.insert().values(data)

    last_record_id = await database.execute(query)
    return {**data, "id": last_record_id}

#editar calificacion
@router.patch("/calificate/{calification_id}", response_model=CalificationPost)
async def update_calification(calification_id: int, calification: CalificationPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    query = calification_table.update().where(calification_table.c.id == calification_id).values(calification.dict(exclude_unset=True))
    await database.execute(query)
    query = calification_table.select().where(calification_table.c.id == calification_id)
    return await database.fetch_one(query)

#eliminar calificación de un post
@router.delete("/calificate/{calification_id}")
async def delete_calification(calification_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    query = calification_table.delete().where(calification_table.c.id == calification_id).where(calification_table.c.user_id == current_user.id)
    await database.execute(query)
    return {"message": "Calification deleted successfully"}

#crear etiqueta
@router.post("/tag", response_model=Tag, status_code=201)
async def create_tag(tag: TagIn):
    query = tag_table.insert().values(tag.dict())
    last_record_id = await database.execute(query)
    return {**tag.dict(), "id": last_record_id}

#obtener todas las etiquetas
@router.get("/tags", response_model=list[Tag])
async def get_all_tags():
    query = tag_table.select()
    return await database.fetch_all(query)

#obtener etiqueta por id
@router.get("/tag/{tag_id}", response_model=Tag)
async def get_tag(tag_id: int):
    query = tag_table.select().where(tag_table.c.id == tag_id)
    return await database.fetch_one(query)

#asingar etiqueta a un post
@router.post("/tag/post", response_model=TagPost, status_code=201)
async def tag_post(tag_post: TagPostIn):
    query = post_tag_table.insert().values(tag_post.dict())
    last_record_id = await database.execute(query)
    return {**tag_post.dict(), "id": last_record_id}

#obtener todas las etiquetas de un post
@router.get("/tag/post/{post_id}", response_model=list[Tag])
async def get_post_tags(post_id: int):
    query = tag_table.join(post_tag_table).select().where(post_tag_table.c.post_id == post_id)
    return await database.fetch_all(query)

@router.get("/post/tag/{tag_id}", response_model=list[UserPost])
async def get_post_by_tag(tag_id: int):
    query = post_table.join(post_tag_table).select().where(post_tag_table.c.tag_id == tag_id)
    return await database.fetch_all(query)