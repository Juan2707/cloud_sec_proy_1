from fastapi import APIRouter, HTTPException, Depends
from typing import Annotated
from datetime import datetime
from blogapi.database import post_table, database, calification_table, tag_table, post_tag_table, user_table
from blogapi.models.post import UserPost, UserPostIn, CalificationPost, CalificationPostIn, UserPostWithMyCalification, Tag, TagPost, TagIn, TagPostIn
from blogapi.models.user import User, UserWithPosts
from blogapi.security import get_current_user
from sqlalchemy import select, func

router = APIRouter()


async def check_if_tag_exists(tag_name: str):
    query = tag_table.select().where(tag_table.c.name == tag_name)
    return await database.fetch_one(query)

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

@router.get("/post/{post_id}/calification", response_model=UserPostWithMyCalification)
async def get_post_califications(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    post = await find_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["private"] and post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    my_calification = await get_calification_by_user(post_id, current_user.id)
    if not my_calification:
        my_calification = None
    return {**post, "my_calification": my_calification}

@router.post("/post",response_model=UserPost, status_code=201)
async def create_post(post: UserPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    data = {**post.dict(), "author_id": current_user.id, "publication_date": datetime.now().isoformat(), "avg_calification": 0, "amount_califications": 0}
    query = post_table.insert().values(data)
    last_record_id = await database.execute(query)
    return {**data, "id": last_record_id}

@router.get("/post", response_model= list[UserPost])
async def get_all_posts(current_user: Annotated[User, Depends(get_current_user)]):
    query = post_table.select()
    return await database.fetch_all(query)

#get all public posts
@router.get("/post/public", response_model= list[UserPost])
async def get_all_public_posts(current_user: Annotated[User, Depends(get_current_user)]):
    query = post_table.select().where(post_table.c.private == False)
    return await database.fetch_all(query)


@router.get("/post/user/{author_id}/posts", response_model= UserWithPosts)
async def get_user_with_posts(author_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    if author_id == f"{current_user.id}":
        query = post_table.select().where(post_table.c.author_id == author_id)
        posts = await database.fetch_all(query)
        print(posts)
        data = {"user":current_user,
                "posts": posts}
        return data
    else:
        query = user_table.select().where(user_table.c.id == author_id)
        user = await database.fetch_one(query)
        data = {"user":user,
                "posts": await database.fetch_all(post_table.select().where(post_table.c.author_id == author_id, post_table.c.private == False))}
        return data


@router.get("/post/{post_id}", response_model=UserPost)
async def get_post(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    post = await find_post(post_id)
    if post["private"] and post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    return post

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

#make post public
@router.patch("/post/{post_id}/public")
async def make_post_public(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    await verify_post_owner(post_id, current_user)
    query = post_table.update().where(post_table.c.id == post_id).values(private=False)
    await database.execute(query)
    return {"message": "Post is now public"}

#make post private
@router.patch("/post/{post_id}/private")
async def make_post_private(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    await verify_post_owner(post_id, current_user)  
    query = post_table.update().where(post_table.c.id == post_id).values(private=True)
    await database.execute(query)
    return {"message": "Post is now private"}

@router.post("/calificate", response_model=CalificationPost, status_code=201)
async def calificate_post(calification: CalificationPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    post = await find_post(calification.post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["private"] and post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    #verificar que el usuario no haya calificado antes
    my_calification = await get_calification_by_user(calification.post_id, current_user.id)
    if my_calification:
        raise HTTPException(status_code=400, detail="You have already rated this post")
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
    #obtener vieja calificacion
    query = calification_table.select().where(calification_table.c.id == calification_id)
    old_calification = await database.fetch_one(query)
    #Check if the user is the owner of the calification
    if old_calification["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this calification")
    query = post_table.select().where(post_table.c.id == calification.post_id)
    post = await database.fetch_one(query)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["private"] and post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
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
    query = calification_table.select().where(calification_table.c.id == calification_id)
    calification = await database.fetch_one(query)
    if not calification:
        raise HTTPException(status_code=404, detail="Calification not found")
    #Check if the user is the owner of the calification
    if calification["user_id"] != current_user.id:
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
    query = calification_table.select().where(calification_table.c.post_id == post_id, calification_table.c.user_id == current_user.id)
    return await database.fetch_all(query)

#crear etiqueta
@router.post("/tag", response_model=Tag, status_code=201)
async def create_tag(tag: TagIn,  current_user: Annotated[User, Depends(get_current_user)]):
    if await check_if_tag_exists(tag.name):
        raise HTTPException(status_code=400, detail="Tag already exists")
    query = tag_table.insert().values(tag.dict())
    last_record_id = await database.execute(query)
    return {**tag.dict(), "id": last_record_id}

#obtener todas las etiquetas
@router.get("/tags", response_model=list[Tag])
async def get_all_tags( current_user: Annotated[User, Depends(get_current_user)]):
    query = tag_table.select()
    return await database.fetch_all(query)

#obtener etiqueta por id
@router.get("/tag/{tag_id}", response_model=Tag)
async def get_tag(tag_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    query = tag_table.select().where(tag_table.c.id == tag_id)
    return await database.fetch_one(query)

#asingar etiqueta a un post
@router.post("/tag/post", response_model=TagPost, status_code=201)
async def create_tag_post(tag_post: TagPostIn, current_user: Annotated[User, Depends(get_current_user)]):
    await verify_post_owner(tag_post.post_id, current_user)
    query = post_tag_table.insert().values(tag_post.dict())
    last_record_id = await database.execute(query)
    return {**tag_post.dict(), "id": last_record_id}

#obtener todas las etiquetas de un post
@router.get("/tag/post/{post_id}", response_model=list[Tag])
async def get_post_tags(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    post = await find_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["private"] and post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    query = tag_table.join(post_tag_table).select().where(post_tag_table.c.post_id == post_id)
    return await database.fetch_all(query)

@router.get("/post/tag/{tag_id}", response_model=list[UserPost])
async def get_post_by_tag(tag_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    #Ademas la query debe filtrar los post privados
    query = post_table.join(post_tag_table).select().where(post_tag_table.c.tag_id == tag_id, post_table.c.private == False)
    return await database.fetch_all(query)

#get user posts by tag
@router.get("/user/{author_id}/posts/tag/{tag_id}", response_model=UserWithPosts)
async def get_user_posts_by_tag(author_id: str, tag_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    data = {}
    if author_id == f"{current_user.id}":
        data = {"user":current_user,
                "posts": await database.fetch_all(post_table.join(post_tag_table).select().where(post_tag_table.c.tag_id == tag_id, post_table.c.author_id == author_id))}
    else:
        query = user_table.select().where(user_table.c.id == author_id)
        user = await database.fetch_one(query)
        data = {"user":user,
                "posts": await database.fetch_all(post_table.join(post_tag_table).select().where(post_tag_table.c.tag_id == tag_id, post_table.c.author_id == author_id, post_table.c.private == False))}
    return data