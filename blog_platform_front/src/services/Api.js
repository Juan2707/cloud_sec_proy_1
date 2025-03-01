const BASE_URL = "http://127.0.0.1:8000";


//Incorporated
export const register =  async (email, username, password) => {
    try{
        const response = await fetch(`${BASE_URL}/user`,{
            method: 'POST',
            body: JSON.stringify({email:email, username:username, password:password}),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error desconocido en el registro' };
        }
        return { error: false, data };
    }   
    catch(error){
        console.error('Error en el registro ', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
};
//Incorporated
export const login = async (email, password) => {
    try{
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        const response = await fetch(`${BASE_URL}/token`,{
            method: 'POST',
            //aqui el body es x-www-form-urlencoded con Key username y Key password con los valores necesarios para el login
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error en el login' };
        }
        localStorage.setItem('token', data.token);
        return { error: false, data };
    } catch(error){
        console.error('Error en el login', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const get_user = async (id,token) => {
    try{
        const response = await fetch(`${BASE_URL}/user/${id}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener el usuario' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener el usuario', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }

}

export const get_my_user = async (token) => {
    try{
        const response = await fetch(`${BASE_URL}/myuser`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener el usuario' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener el usuario', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

//Incorporated
export const newPost = async (title, content, isPrivate, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post`,{
            method: 'POST',
            body: JSON.stringify({title: title, content: content, private: isPrivate}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al crear el post' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al crear el post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const makePostPublic = async (post_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/${post_id}/public`,{
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al hacer público el post' };
        }
        return { error: false, data };

    }
    catch(error){
        console.error('Error al hacer público el post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const makePostPrivate = async (post_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/${post_id}/private`,{
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al hacer privado el post' };
        }
        return { error: false, data };

    }
    catch(error){
        console.error('Error al hacer privado el post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const getPostsByUser = async (author_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/user/${author_id}/posts`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener los posts' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener los posts', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}
//Aún no get_all posts por que nadie tiene acceso a todos los posts
//Incorporated
export const get_all_public_posts = async (token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/public`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener los posts' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener los posts', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const get_single_post = async (post_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/${post_id}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener el post' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener el post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const edit_post = async (post_id, title, content, isPrivate, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/${post_id}`,{
            method: 'PATCH',
            body: JSON.stringify({title: title, content: content, private: isPrivate}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al editar el post' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al editar el post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const delete_post = async (post_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/${post_id}`,{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al eliminar el post' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al eliminar el post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}
//Incorporated
export const calificate_post = async (post_id, calification, token) => {
    try{
        const response = await fetch(`${BASE_URL}/calificate`,{
            method: 'POST',
            body: JSON.stringify({post_id: post_id, calification: calification}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al calificar el post' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al calificar el post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}
//Incorporated
export const get_my_calification_on_post = async(post_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/calificate/${post_id}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener la calificación' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener la calificación', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const get_post_with_calification = async(post_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/${post_id}/calification`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener la calificación' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener la calificación', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}
//Incorporated
export const update_calification = async(calification_id, post_id, calification, token) => {
    try{
        const response = await fetch(`${BASE_URL}/calificate/${calification_id}`,{
            method: 'PATCH',
            body: JSON.stringify({post_id: post_id, calification: calification}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al actualizar la calificación' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al actualizar la calificación', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const delete_calification = async(calification_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/calificate/${calification_id}`,{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al eliminar la calificación' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al eliminar la calificación', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}
//Incorporated
export const create_tag = async(tag, token) => {

    try{
        const response = await fetch(`${BASE_URL}/tag`,{
            method: 'POST',
            body: JSON.stringify({name: tag}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al crear el tag' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al crear el tag', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}
//Incorporated
export const get_all_tags = async(token) => {
    try{
        const response = await fetch(`${BASE_URL}/tags`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener los tags' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener los tags', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const get_tag = async(tag_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/tag/${tag_id}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener el tag' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener el tag', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}
//Incorporated
export const link_tag_to_post = async(post_id, tag_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/tag/post`,{
            method: 'POST',
            body: JSON.stringify({post_id: post_id, tag_id: tag_id}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al vincular el tag al post' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al vincular el tag al post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const unlink_tag_from_post = async(post_id, tag_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/tag/${tag_id}/post/${post_id}`,{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }); 
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al desvincular el tag del post' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al desvincular el tag del post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}
//Incorporated
export const get_tags_by_post = async(post_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/tag/post/${post_id}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener los tags del post' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener los tags del post', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const get_posts_by_tag = async(tag_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/tag/${tag_id}/posts`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener los posts del tag' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener los posts del tag', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const get_from_user_posts_by_tag = async(author_id, tag_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/user/${author_id}/posts/tag/${tag_id}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener los posts del tag' };
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener los posts del tag', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const get_from_user_posts_by_tags = async (author_id, tags, token) => {
    try{
        const response = await fetch(`${BASE_URL}/user/${author_id}/posts/by-tags`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`},
            body: JSON.stringify({tag_ids: tags}),
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener los posts del tag' };
        }
        //descartar en la data los posts repetidos
        for (let i = 0; i < data.length; i++){
            for (let j = i+1; j < data.length; j++){
                if (data[i].id === data[j].id){
                    //La función splice elimina un elemento en la posición j
                    data.splice(j,1);
                }
            }
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener los posts del tag', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}

export const get_posts_by_tags = async (tags, token) => {
    try{
        const response = await fetch(`${BASE_URL}/posts/by-tags`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`},
            body: JSON.stringify({tag_ids: tags}),
        });
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error al obtener los posts del tag' };
        }
        for (let i = 0; i < data.length; i++){
            for (let j = i+1; j < data.length; j++){
                if (data[i].id === data[j].id){
                    //La función splice elimina un elemento en la posición j
                    data.splice(j,1);
                }
            }
        }
        return { error: false, data };
    }
    catch(error){
        console.error('Error al obtener los posts del tag', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}