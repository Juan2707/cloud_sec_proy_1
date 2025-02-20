import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Post from '../../components/Post';
//Aqui iria el import de la api
import { get_all_public_posts } from '../../services/Api';
import { useAuth } from '../../components/AuthContext';



function Feed() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  
  useEffect(() =>{
    const cargarPosts = async() =>{
      try{
        const data = await get_all_public_posts(user.access_token);
        setPosts(data.data);
      }
      catch(error){
        console.error('Error fetching posts', error);
        if(error.response.status === 401){
          navigate('/login');
        }
        //Poblar con un post de ejemplo
        setPosts([{
          id: 1,
          title: 'Post de ejemplo',
          content: 'Este es un post de ejemplo',
          author_id: 1,
          date: '2021-10-01'
        }]);
      }
    };

    cargarPosts();
  },[location]);
  //Revisar post conexion con api, el delete es con backend, debe haber una forma de solo hacer refresh de la pagina


  return (
    <div>
      <h1>Feed</h1>
      {posts.map((post) => (
        <Post key={post.id} data={post} />
      ))}
      <button onClick={() => navigate('/create')}>Crear Post</button>
    </div>
  );
}

export default Feed;
