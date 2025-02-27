import React, { useState, useEffect } from 'react';
import { get_tags_by_post, get_my_calification_on_post, get_user, get_single_post } from '../services/Api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import NonEditableTag from './NonEditableTag';
import Calificate from './Calificate';
import './DetailedPost.css';

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
  const [date, setDate] = useState('');

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
    const date1 = new Date(data.publication_date);
    const date2 = date1.toISOString().split('T');
    setDate(date2[0]);
  }, [post_id, user.access_token, navigate, refresh]); // Use refresh as a trigger for re-fetching

  const onRefresh = () => {
    setRefresh(prev => !prev);
  };

  return (
    <div className='post-container'>
    <div className='post-head'>
      <h2>{data.title}</h2>
      <div className = "post-head-grid-container">
        <div>
        <small>Author: </small>
        <Link to={`/profile/${data.author_id}`}>{username}</Link>
        </div>
        <div>
        <small> Fecha de publicación: {date}</small>
        </div>
      </div>
    </div>
    <div className='post-body'>
    <p>{data.content}</p>
    <h3>Tags</h3>
      {tags.map((tag) => (
        <NonEditableTag key={tag.id} name={tag.name} isSelected ={false} />
      ))}
      <div className="post-body-grid-container">
        <div>
        <h3>Calificacion: {data.avg_calification}</h3>
        <small> {data.amount_califications} usuarios han calificado este Post</small>
        </div>
        <div>
        <h3>Tu calificación es {myCalification}</h3>
        <Calificate myCalification={myCalification} token={user.access_token} post_id={data.id} onChange={onRefresh} calification_id={calification_id}/>
        </div>
      </div>
      <button onClick={() => navigate(`/post/${data.id}`)}>Detalles</button>
      </div>
    </div>
  );
}

export default DetailedPost;
