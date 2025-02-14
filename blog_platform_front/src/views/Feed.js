import React, { useState, useEffect } from 'react';
import Post from '../components/Post';

function Feed() {
  const [posts, setPosts] = useState([
    { id: 1, title: "Post 1", content: "Content of post 1", author: "Author Name", date: "2022-01-01" },
    { id: 2, title: "Post 2", content: "Content of post 2", author: "Another Author", date: "2022-02-01" }
  ]);

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
