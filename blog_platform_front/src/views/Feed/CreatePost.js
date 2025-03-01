import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { get_all_tags, newPost, link_tag_to_post, create_tag } from '../../services/Api';
import Tag from '../../components/Tag';
import {getSelectedTags, clearSelectedTags} from '../../services/DataInterface';
import { useAuth } from '../../components/AuthContext';
import './CreatePost.css';

function CreatePost() {
  const { user }  = useAuth();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [thereIsChange, setThereIsChange] = useState(false);
  const [buttonColors, setButtonColors] = useState(["#AEBFBE","black","Post Privado"]);
  const [privatePost, setPrivatePost] = useState(true);
  const [trigger, setTrigger] = useState(false);
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
  },[thereIsChange, location]);


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
       const post_created =await newPost(title, content, privatePost, user.access_token);
       
      const selectedTags = getSelectedTags();
      
      for (let i=0; i<selectedTags.length; i++){
        //const new_tag = await create_tag(selectedTags[i]);
        await link_tag_to_post(post_created.data.id, selectedTags[i], user.access_token);
      }
      navigate('/feed');
    }
    catch(error){
      alert.error('Error creating post', error);
    }
    clearSelectedTags();
  }

  const toggleButtonColor = () => {
    setButtonColors(prevColors =>{
      if(prevColors[0] === "#AEBFBE"){
        setPrivatePost(false);
        return ["#003d39","white", "Post Publico"];
      }
      else{
        setPrivatePost(true);
        return ["#AEBFBE","black", "Post Privado"];
      }
    });
  }

  return (
    <div>
      <h1>Crear Post</h1>
      <button onClick={() =>navigate('/feed')}>Regresar al inicio</button>
    <div className='newpost-container'>
      <div className="creation-cpntainer">
      <div className='newpost-box'>
      
      
    <br />
    <div className="feed-tag">
    {tags.map(tag => (
          <Tag key={tag.id} {...tag} onChange={refresh}/>
        ))}
    </div>
    <div className="grid-container">
      <div>
      <button
      onClick={toggleButtonColor}
      style={{ backgroundColor: buttonColors[0], color: buttonColors[1] }}
    >
      {buttonColors[2]}
    </button>
      </div>
    <div>
    <input type="text" value={newTag} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="Escribe nuevos tags"/>
    </div>
    </div>
      
        
      <form onSubmit={handleSubmit}>
        <label>
          Titulo:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        
        <label>
          Contenido:
          <br />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </label>
        <br />
        
        <button type="submit">Crear Post</button>
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
        <small> Fecha de publicación: Hoy</small>
        </div>
      </div>
    </div>
    <div className='post-body'>
    <p>{content}</p>
    <h3>Tags</h3>
      Los Tags seleccionados se verán aquí como lista al publicar
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

export default CreatePost;
