import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Post from '../../components/Post';
//Aqui iria el import de la api
import { get_all_public_posts, get_my_user, get_all_tags, get_posts_by_tags } from '../../services/Api';
import { useAuth } from '../../components/AuthContext';
import Tag from '../../components/Tag';
import { getRemovedTags, getSelectedTags, clearRemovedTags, clearSelectedTags } from '../../services/DataInterface';



function Feed() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [user_id, setUser_id] = useState('');
  const [tags, setTags] = useState([]);
  
  useEffect(() =>{
    console.log("Selected Tags",getSelectedTags())
    console.log("Removed tags",getRemovedTags())
    const cargarTags = async() =>{
      try{
        const data = await get_all_tags(user.access_token);
        setTags(data.data);
      }
      catch(error){
        console.error('Error fetching tags', error);
        if(error.response.status === 401){
          navigate('/login');
        }
      }
    }
    cargarTags();
    const cargarPosts = async() => {
      try {
        
        let data;
        if (getSelectedTags().length > 0) {
          const response = await get_posts_by_tags(getSelectedTags(), user.access_token);
          if (response.error) throw new Error("Failed to fetch posts");
          data = response.data;
          setPosts(data || []); // Asumir que podría no haber datos.
        } else {
          const response = await get_all_public_posts(user.access_token);
          if (response.error) throw new Error("Failed to fetch public posts");
          data = response.data;
          setPosts(data || []);
        }
    
        const userInfoResponse = await get_my_user(user.access_token);
        if (userInfoResponse.error) throw new Error("Failed to fetch user info");
        const userInfo = userInfoResponse.data;
        setUser_id(userInfo.id);
      } catch (error) {
        console.error('Error fetching data', error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          // Añade manejo de otros tipos de errores, posiblemente mostrando un mensaje al usuario.
          alert("An error occurred while fetching data.");
        }
      }
    };

    cargarPosts();
  },[trigger]);
  //Revisar post conexion con api, el delete es con backend, debe haber una forma de solo hacer refresh de la pagina

  const refresh = () =>{
    setTrigger(!trigger);
  }

  const onClickButton= (route)=>{
    clearRemovedTags();
    clearSelectedTags();
    navigate(route);
  }

  return (
    <div>
      
      {tags.map(tag => (
          <Tag key={tag.id} {...tag} onChange={refresh}/>
        ))}
      <button onClick={() => onClickButton(`/myprofile/${user_id}`)}>My Profile</button>
      <h1>Feed</h1>
      {posts.map((post) => (
        <Post key={post.id} data={post} onRefresh={refresh}/>
      ))}
      <button onClick={() => onClickButton('/create')}>Crear Post</button>
    </div>
  );
}

export default Feed;
