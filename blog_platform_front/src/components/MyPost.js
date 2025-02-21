import { useState, useEffect } from 'react';
import Post from './Post';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { makePostPrivate, makePostPublic, delete_post } from '../services/Api';
import EditPost from '../views/Feed/EditPost';

function MyPost({data, onRefresh}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isPrivate, setIsPrivate] = useState(false);
    const [buttonValues, setButtonValues] = useState(["white", "black", "make private"]);
    useEffect(() => {
        setIsPrivate(data.private);
        if (isPrivate) {
            setButtonValues(["white", "black", "make public"]);
        }
        else {
            setButtonValues(["black", "white", "make private"]);
        }
    }, [isPrivate, data]);

    const handlePrivacy = async () => {
        try {
            if (isPrivate) {
                await makePostPublic(data.id, user.access_token);
                setIsPrivate(false);
                setButtonValues(["black", "white", "make private"]);
            }
            else {
                await makePostPrivate(data.id, user.access_token);
                setIsPrivate(true);
                setButtonValues(["white", "black", "make public"]);
            }
            onRefresh();
        }
        catch (error) {
            console.error('Error changing privacy', error);
            if (error.response.status === 401) {
                navigate('/login');
            }
        }
    }

    const handleDelete = async () => {
        try {
            await delete_post(data.id, user.access_token);
            onRefresh();
        }
        catch (error) {
            console.error('Error deleting post', error);
            if (error.response.status === 401) {
                navigate('/login');
            }
        }
    }
    
    

  return (
    <div>
      <Post key={data.id} data={data} onRefresh={onRefresh}/>
      <button onClick={() => navigate(`/editpost/${data.id}`)}>Edit Post</button>
        <button onClick={handleDelete}>Delete Post</button>
        <button onClick={handlePrivacy} style={{backgroundColor: buttonValues[0], color: buttonValues[1]}}>{buttonValues[2]}</button>
    </div>
  );

}

export default MyPost;