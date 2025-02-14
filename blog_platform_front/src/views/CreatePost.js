import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TagCreation from '../components/TagCreation';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  // Definir las etiquetas posibles aquí (o podrían venir de una API)
  const availableTags = ['tech', 'health', 'finance']; // Ejemplo de etiquetas disponibles

  const handleTagsChange = (selectedTags) => {
    setTags(selectedTags);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Creating post with:', { title, content, author, tags });
    navigate('/feed'); // Redirige al feed principal tras crear el post
  };

  return (
    <div>
      <h1>Create Post</h1>
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
        <label>
          Author:
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </label>
        <br />
        <TagCreation tags={availableTags} onTagsChange={handleTagsChange} />
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
}

export default CreatePost;
