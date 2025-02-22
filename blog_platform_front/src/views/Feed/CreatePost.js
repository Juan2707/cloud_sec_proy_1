import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { get_all_tags, newPost, link_tag_to_post, create_tag } from '../../services/Api';
import Tag from '../../components/Tag';
import {getSelectedTags, clearSelectedTags} from '../../services/DataInterface';
import { useAuth } from '../../components/AuthContext';

function CreatePost() {
  const { user }  = useAuth();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [thereIsChange, setThereIsChange] = useState(false);
  const [buttonColors, setButtonColors] = useState(["white","black","Private Post"]);
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
      if(prevColors[0] === "white"){
        setPrivatePost(false);
        return ["blue","white", "Public Post"];
      }
      else{
        setPrivatePost(true);
        return ["white","black", "Private Post"];
      }
    });
  }

  return (
    <div>
      <h1>Create Post</h1>
      <button
      onClick={toggleButtonColor}
      style={{ backgroundColor: buttonColors[0], color: buttonColors[1] }}
    >
      {buttonColors[2]}
    </button>
    <br />
      {tags.map(tag => (
          <Tag key={tag.id} {...tag} onChange={refresh}/>
        ))}
        <input type="text" value={newTag} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="New Tags here..."/>
        <br />
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <br />
        <label>
          Content:
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </label>
        <br />
        
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
}

export default CreatePost;
