import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
//import TagCreation from '../../components/TagCreation';
import { get_all_tags, unlink_tag_from_post, link_tag_to_post, create_tag, get_single_post, get_tags_by_post, edit_post } from '../../services/Api';
import Tag from '../../components/Tag';
import {getSelectedTags, clearSelectedTags, getRemovedTags, clearRemovedTags} from '../../services/DataInterface';
import { useAuth } from '../../components/AuthContext';
import './CreatePost.css';

function EditPost() {
    const { post_id } = useParams();
  const { user }  = useAuth();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [thereIsChange, setThereIsChange] = useState(false);
  const [buttonColors, setButtonColors] = useState(["white","black","Private Post"]);
  const [privatePost, setPrivatePost] = useState(true);  
  const [trigger, setTrigger] = useState(false);
  const [user_id, setUser_id] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const refresh = () =>{
    setTrigger(!trigger);
  }


  useEffect(() =>{
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
    };
    cargarTags();
    const cargarMisTags = async() => {
        try {
            const data = await get_tags_by_post(post_id, user.access_token);
            setSelectedTags(data.data.map(tag => tag.id)); // Asumiendo que data.data es un array de tags
        } catch(error) {
            console.error('Error fetching tags', error);
        }
    };
    cargarMisTags();
    const cargarPost = async() =>{
        try{
            const data = await get_single_post(post_id, user.access_token);
            if(data.error){
                console.error('Error fetching post', data.error);
                return;
            }
            
            setTitle(data.data.title);
            setContent(data.data.content);
            setPrivatePost(data.data.private);
            setUser_id(data.data.author_id);
            const date1 = new Date(data.data.publication_date);
            const date2 = date1.toISOString().split('T');
            setDate(date2[0]);
            
        }
        catch(error){
            console.error('Error fetching post', error);
            if(error.response.status === 401){
                navigate('/login');
            }
        }
    };
    cargarPost();
    
    
  },[thereIsChange, location]);

  useEffect(() => {
    // Este efecto se ejecuta cada vez que privatePost cambia
  
    const colorButton = () => {
      if(privatePost){
        setButtonColors(["#AEBFBE","black", "Hacer Post Publico"]);
      }
      else{
        setButtonColors(["#003d39","white", "Hacer Post Privado"]);
      }
    }
    colorButton();
  }, [privatePost]);


  const handleCreateTag = async (tag) => {
    try{
      
      const new_tag = await create_tag(tag, user.access_token);
      
      setTags([...tags, new_tag]);
      setThereIsChange(!thereIsChange);
    }
    catch(error){
      console.error('Error creating tag', error);
    }
  }
  
  const handleKeyDown = async (e) => {
    if(e.key === "Enter"){
      handleCreateTag(newTag);
      setNewTag('');
    }

  };

  const handleChange = (e) => {
    setNewTag(e.target.value);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
       await edit_post(post_id, title, content, privatePost, user.access_token);
       const removedTags  = getRemovedTags();
         for (let i=0; i<removedTags.length; i++){
            await unlink_tag_from_post(post_id, removedTags[i], user.access_token);
        }
      const selectedTags = getSelectedTags();
      
      for (let i=0; i<selectedTags.length; i++){
        //const new_tag = await create_tag(selectedTags[i]);
        await link_tag_to_post(post_id, selectedTags[i], user.access_token);
      }
      navigate('/feed');
    }
    catch(error){
      alert.error('Error editing post', error);
    }
    clearSelectedTags();
    clearRemovedTags();
  }

  const toggleButtonColor = () => {
    setButtonColors(prevColors =>{
      if(prevColors[0] === "#AEBFBE"){
        setPrivatePost(false);
        return["#003d39","white", "Hacer Post Privado"];
      }
      else{
        setPrivatePost(true);
        return ["#AEBFBE","black", "Hacer Post Publico"];
      }
    });
  }

  return (
    <div>
      <h1>Editar Post</h1>
      <button onClick={() =>navigate(`/myprofile/${user_id}`)}>Regresar a mi perfil</button>
      <div className='newpost-container'>
        <div className='creation-container'>
        <div className='newpost-box'>
        <br />
          <div className='feed-tag'>
      
    {tags.map(tag => (
    <Tag key={tag.id} id={tag.id} name={tag.name} isSelected={selectedTags.includes(tag.id)} onChange={refresh} />
))}
</div>
<div className='grid-container'>
<div>
<button
      onClick={toggleButtonColor}
      style={{ backgroundColor: buttonColors[0], color: buttonColors[1] }}
    >
      {buttonColors[2]}
    </button>
</div>
<div>

        <input type="text" value={newTag} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="Escribe nuevos Tags!"/>
        </div>
        </div>
      <form onSubmit={handleSubmit}>
        <label>
          Titulo:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <br />
        <label>
          Contenido:
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </label>
        <br />
        
        <button type="submit">Actualizar Post</button>
      </form>
    </div>
    </div>
    <div className='post-container'>
    <div className='post-head'>
      <h2>{title}</h2>
      <div className = "post-head-grid-container">
        <div>
        <small>Autor: You</small>
        
        </div>
        <div>
        <small> Fecha de publicación: {date}</small>
        </div>
      </div>
    </div>
    <div className='post-body'>
    <p>{content}</p>
    <h3>Tags</h3>
    Los Tags seleccionados se verán aquí como lista al actualizar
      <div className="post-body-grid-container">
        <div>
        <h3>Calificacion: 0</h3>
        <small> 0 usuarios han calificado este Post</small>
        </div>
        <div>
        <h3>Tu calificación es 0</h3>
        <input type="text" value={0} placeholder={0} readOnly/>
    
        </div>
      </div>
      <button>Detalles</button>
      </div>
    </div>
    </div>
    </div>
  );
}

export default EditPost;
