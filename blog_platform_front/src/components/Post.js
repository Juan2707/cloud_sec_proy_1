import React from 'react';

function Post({ id, title, content, author, date, onDelete }) {
  const handleDelete = () => {
    // Aquí iría la lógica para llamar a la API y eliminar el post
    console.log('Deleting post:', id);
    onDelete(id); // Función pasada como prop para manejar la eliminación
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
      <small>By {author} on {date}</small>
      {/* Solo muestra el botón de eliminar si es el autor (esto necesita ajustes reales de autenticación) */}
      {author === "Author Name" && <button onClick={handleDelete}>Delete</button>}
    </div>
  );
}

export default Post;
