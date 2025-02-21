import React, { useState, useEffect } from 'react';
import { get_tags_by_post, get_my_calification_on_post, get_user, get_single_post } from '../services/Api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import NonEditableTag from './NonEditableTag';
import Calificate from './Calificate';

function DetailedPost() {
  const { post_id } = useParams(); // Asegúrate de usar useParams para obtener post_id
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [username, setUsername] = useState('');
  const [tags, setTags] = useState([]);
  const [myCalification, setMyCalification] = useState(0);
  const [calification_id, setCalification_id] = useState(0);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const postData = await get_single_post(post_id, user.access_token);
        if (postData.error) {
          console.error('Error fetching post', postData.error);
          return;
        }
        setData(postData.data);
        setUsername((await get_user(postData.data.author_id, user.access_token)).data.username);
        setTags((await get_tags_by_post(post_id, user.access_token)).data);
        const calData = await get_my_calification_on_post(post_id, user.access_token);
        if (calData.data.length === 0) {
          setMyCalification(-1);
        } else {
          setMyCalification(calData.data[0].calification);
          setCalification_id(calData.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching data', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    }

    fetchData();
  }, [post_id, user.access_token, navigate, refresh]); // Use refresh as a trigger for re-fetching

  const onRefresh = () => {
    setRefresh(prev => !prev);
  };

  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.content}</p>
      <small>By {username} on {data.publication_date}</small>
      <h2>With Calification {data.avg_calification} of {data.amount_califications} users</h2>
      <h2>Tags</h2>
      {tags.map((tag) => (
        <NonEditableTag key={tag.id} name={tag.name} isSelected={false} />
      ))}
      <h2>Your Calification is {myCalification}</h2>
      <Calificate myCalification={myCalification} token={user.access_token} post_id={post_id} onChange={onRefresh} calification_id={calification_id}/>
    </div>
  );
}

export default DetailedPost;
