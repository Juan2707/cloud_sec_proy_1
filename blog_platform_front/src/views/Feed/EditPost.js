import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
//import TagCreation from '../../components/TagCreation';
import { get_all_tags, unlink_tag_from_post, link_tag_to_post, create_tag, get_single_post, get_tags_by_post, edit_post } from '../../services/Api';
import Tag from '../../components/Tag';
import {getSelectedTags, clearSelectedTags, getRemovedTags, clearRemovedTags} from '../../services/DataInterface';
import { useAuth } from '../../components/AuthContext';

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
  const navigate = useNavigate();


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
    <br />{tags.map(tag => (
    <Tag key={tag.id} id={tag.id} name={tag.name} isSelected={selectedTags.includes(tag.id)} />
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
        
        <button type="submit">Update Post</button>
      </form>
    </div>
  );
}

export default EditPost;
