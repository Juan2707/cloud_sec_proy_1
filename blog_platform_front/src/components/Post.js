import React from 'react';

function Post({data }) {
  // Conseguir con author_id el nombre del autor
  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.content}</p>
      <small>By {data.author_id} on {data.publication_date}</small>
      <h2>With Calification {data.avg_calification} of {data.amount_califications} users</h2>
  
    </div>
  );
}

export default Post;
