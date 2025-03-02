const BASE_URL = "http://127.0.0.1:8000";


/**
 * Solicitud HTTP de regustro de nuevo usuario
 * @param {string} email 
 * @param {string} username 
 * @param {string} password 
 * @returns 
 */
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
/**
 * Solicita un token de acceso al servidor, inicia sesión.
 * @param {string} email 
 * @param {string} password 
 * @returns 
 */
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
                'Content-Type': 'application/x-www-form-urlencoded' //EL tipo de contenido es particular aqui por motivos de seguridad
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

/**
 * Solicitud HTTP para obtener un usuario por su id con token de acceso
 * @param {number} id 
 * @param {string} token 
 * @returns 
 */
export const get_user = async (id,token) => {
    try{
        const response = await fetch(`${BASE_URL}/user/${id}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` //Envio del token de acceso
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
/**
 * Solicitud HTTP para obtener mi usuario con token de acceso
 * @param {string} token 
 * @returns 
 */
export const get_my_user = async (token) => {
    try{
        const response = await fetch(`${BASE_URL}/myuser`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` //Envio del token de acceso
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

/**
 * Solicitud HTTP para crear un nuevo post con token de acceso
 * @param {string} title 
 * @param {string} content 
 * @param {boolean} isPrivate 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitud HTTP para hacer un post público con token de acceso
 * @param {number} post_id 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitudes HTTP para hacer un post privado con token de acceso
 * @param {*} post_id 
 * @param {*} token 
 * @returns 
 */
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

/**
 * Solicitud HTTP para obtener los posts de un usuario con token de acceso
 * @param {number} author_id 
 * @param {string} token 
 * @returns 
 */
export const getPostsByUser = async (author_id, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/user/${author_id}/posts`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` //Envio del token de acceso
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
//Aún no get_all posts por que nadie tiene acceso a todos los posts, nadie tiene derecho a ver todos los posts
/**
 * Soliciutd HTTP para obtener todos los posts públicos con token de acceso
 * @param {string} token 
 * @returns 
 */
export const get_all_public_posts = async (token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/public`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` //Envio del token de acceso
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
/**
 * Solicitud HTTP para obtener un post individual con token de acceso
 * @param {number} post_id 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitud HTTP para editar un post con token de acceso
 * @param {number} post_id 
 * @param {string} title 
 * @param {string} content 
 * @param {boolean} isPrivate 
 * @param {string} token 
 * @returns 
 */
export const edit_post = async (post_id, title, content, isPrivate, token) => {
    try{
        const response = await fetch(`${BASE_URL}/post/${post_id}`,{
            method: 'PATCH',
            body: JSON.stringify({title: title, content: content, private: isPrivate}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` //Envio del token de acceso
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
/**
 * Soliciutd HTTP para eliminar un post con token de acceso
 * @param {number} post_id 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitud HTTP para calificar un post con token de acceso
 * @param {number} post_id 
 * @param {number} calification 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitud HTTP para obtener la calificación propia de un post con token de acceso
 * @param {number} post_id 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitud HTTP para obtener un post con su calificación con token de acceso
 * @param {number} post_id 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitud HTTP para actualizar la calificación de un post con token de acceso
 * @param {number} calification_id 
 * @param {number} post_id 
 * @param {number} calification 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitud HTTP para eliminar la calificación de un post con token de acceso
 * @param {number} calification_id 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitud HTTP para crear una nueva etiqueta con token de acceso
 * @param {string} tag 
 * @param {string} token 
 * @returns 
 */
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
/**
 * Solicitud HTTP 
 * @param {*} token 
 * @returns 
 */
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