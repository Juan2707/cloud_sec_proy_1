import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Post from '../../components/Post';
//Aqui iria el import de la api
import { get_all_public_posts, get_my_user } from '../../services/Api';
import { useAuth } from '../../components/AuthContext';
import MyPost from '../../components/MyPost';



function Feed() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [user_id, setUser_id] = useState('');
  
  useEffect(() =>{
    const cargarPosts = async() =>{
      try{
        const data = await get_all_public_posts(user.access_token);
        setPosts(data.data);
        const data5 = await get_my_user(user.access_token);
        
        setUser_id(data5.data.id);
      }
      catch(error){
        console.error('Error fetching posts', error);
        if(error.response.status === 401){
          navigate('/login');
        }
      }
    };

    cargarPosts();
  },[location, trigger]);
  //Revisar post conexion con api, el delete es con backend, debe haber una forma de solo hacer refresh de la pagina

  const refresh = () =>{
    setTrigger(!trigger);
  }

  return (
    <div>
      <button onClick={() => navigate(`/myprofile/${user_id}`)}>My Profile</button>
      <h1>Feed</h1>
      {posts.map((post) => (
        <Post key={post.id} data={post} onRefresh={refresh}/>
      ))}
      <button onClick={() => navigate('/create')}>Crear Post</button>
    </div>
  );
}

export default Feed;
