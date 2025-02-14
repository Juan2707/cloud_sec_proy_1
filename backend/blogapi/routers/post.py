from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Annotated
from datetime import datetime
from blogapi.database import post_table, database
from blogapi.models.post import UserPost, UserPostIn
from blogapi.models.user import User, UserWithPosts
from blogapi.security import get_current_user
router = APIRouter()

async def find_post(post_id: int):
    query = post_table.select().where(post_table.c.id == post_id)
    return await database.fetch_one(query)

async def verify_post_owner(post_id: int, current_user: User):
    post = await find_post(post_id)
    if post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this post")
    return post

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
    #query = post_table.update().where(post_table.c.id == post_id).values(**update_data.dict())
    await database.execute(query)
    return await find_post(post_id)

@router.delete("/post/{post_id}")
async def delete_post(post_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    await verify_post_owner(post_id, current_user)
    query = post_table.delete().where(post_table.c.id == post_id)
    await database.execute(query)
    return {"message": "Post deleted successfully"}

