import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Post from '../../components/Post';
//Aqui iria el import de la api

function Feed() {
  const [posts, setPosts] = useState([
    { id: 1, title: "Post 1", content: "Content of post 1", author_id: "1", publication_date: "2022-01-01",avg_calification:5, ammount_califications:1 },
    { id: 2, title: "Post 2", content: "Content of post 2", author_id: "2", publication_date: "2022-02-01",avg_calification:4, ammount_califications:1 },
    { id: 3, title: "Post 2", content: "Content of post 3", author_id: "2", publication_date: "2022-02-01",avg_calification:3, ammount_califications:1 },
    { id: 4, title: "Post 2", content: "Content of post 4", author_id: "2", publication_date: "2022-02-01",avg_calification:2,  ammount_califications:1 },
    { id: 5, title: "Post 2", content: "Content of post 5", author_id: "2", publication_date: "2022-02-01",avg_calification:1, ammount_califications:1 },
  ]);
  const navigate = useNavigate();
  //Para cuando no sea con mockup
  //const [posts, setPosts] = useState([]);
//Revisar post conexion con api, el delete es con backend, debe haber una forma de solo hacer refresh de la pagina
  const handleDelete = (postId) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    console.log('Post deleted:', postId);
  };

  return (
    <div>
      <h1>Feed</h1>
      {posts.map(post => (
        <Post key={post.id} {...post} onDelete={handleDelete} />
      ))}
    </div>
  );
}

export default Feed;
