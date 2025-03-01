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
  const [date, setDate] = useState('');
  const [myCalString, setMyCalString] = useState('');
  useEffect(() =>{
    
    const date1 = new Date(data.publication_date);
    const date2 = date1.toISOString().split('T');
    setDate(date2[0]);
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

  useEffect(() => {
      if (myCalification === -1) {
        setMyCalString('No has calificado este Post');
      } else {
        setMyCalString(`Tu calificación es ${myCalification}`);
      }
    }, [myCalification]);


  return (
    <div className='post-container'>
    <div className='post-head'>
      <h2>{data.title}</h2>
      <div className = "post-head-grid-container">
        <div>
        <small>Autor: </small>
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
        <h3>{myCalString}</h3>
        <Calificate myCalification={myCalification} token={user.access_token} post_id={data.id} onChange={onRefresh} calification_id={calification_id}/>
        </div>
      </div>
      <button onClick={() => navigate(`/post/${data.id}`)}>Detalles</button>
      </div>
    </div>
  );
}

export default Post;
