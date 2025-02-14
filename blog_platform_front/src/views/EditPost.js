import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TagCreation from '../components/TagCreation';

function EditPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState([]);
  const { postId } = useParams(); // Obtiene el ID del post desde la URL
  const navigate = useNavigate();

  const handleTagsChange = (selectedTags) => {
    setTags(selectedTags);
  };

  useEffect(() => {
    // Simulación de carga de datos del post para editar
    // Esto debería reemplazarse con una llamada a la API para obtener los datos reales del post
    setTitle("Existing Title");
    setContent("Existing content here...");
    setAuthor("Author Name");
    setTags("tag1, tag2");
  }, [postId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Lógica para enviar los datos actualizados al backend
    console.log('Editing post with:', title, content, author, tags);
    navigate('/feed'); // Redirige al feed principal tras actualizar el post
  };

  return (
    <div>
      <h1>Edit Post</h1>
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
        <label>
          Tags:
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
        <br />
        <TagCreation tags={tags} onTagsChange={handleTagsChange} />
        <button type="submit">Update Post</button>

      </form>
    </div>
  );
}

export default EditPost;
