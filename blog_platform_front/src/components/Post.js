import React, {useState, useEffect} from 'react';
import { get_tags_by_post, get_my_calification_on_post, get_user } from '../services/Api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import NonEditableTag from './NonEditableTag';
import Calificate from './Calificate';
function Post({data, onRefresh }) {
  const [username, setUsername] = useState('');
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [myCalification, setMyCalification] = useState(0);
  const navigate = useNavigate();
  const [calification_id, setCalification_id] = useState(0);
  useEffect(() =>{
    const cargarTags = async() =>{
      try{
        const data1 = await get_tags_by_post(data.id, user.access_token);
        if(data1.error){
          setTags([]);
          console.error('Error fetching tags', data1.error);
          return;
        }
        else{
          setTags(data1.data);
        }
        
        const get_username = await get_user(data.author_id, user.access_token);
        setUsername(get_username.data.username);
      }
      catch(error){
        console.error('Error fetching tags', error);
        setTags([]);
        if(error.response.status === 401){
          navigate('/login');
        }
      }
    };
    const cargarCalification = async() =>{
      try{
        const data2 = await get_my_calification_on_post(data.id, user.access_token);
        //data2.data es un arreglo con un solo elemento o ninguno. Si no hay calificación se pone "-1"
        if(data2.data.length === 0){
          setMyCalification(-1);
          return;
        }
        else{
          setMyCalification(data2.data[0].calification);
          setCalification_id(data2.data[0].id);
        }
      }
      catch(error){
        console.error('Error fetching calification', error);
        if(error.response.status === 401){
          navigate('/login');
        }
      }
    };
    cargarTags();
    cargarCalification();
  },[onRefresh]);


  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.content}</p>
      <small>By {username} on {data.publication_date}</small>
      <Link to={`/profile/${data.author_id}`}>{username}</Link>
      <h2>With Calification {data.avg_calification} of {data.amount_califications} users</h2>
      <h2>Tags</h2>
      {tags.map((tag) => (
        <NonEditableTag key={tag.id} name={tag.name} isSelected ={false} />
      ))}
      <h2>Your Calification is {myCalification}</h2>
      <Calificate myCalification={myCalification} token={user.access_token} post_id={data.id} onChange={onRefresh} calification_id={calification_id}/>
      <button onClick={() => navigate(`/post/${data.id}`)}>Detalles</button>
    </div>
  );
}

export default Post;
