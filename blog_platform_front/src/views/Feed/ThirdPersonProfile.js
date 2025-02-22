import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { get_user,  getPostsByUser } from '../../services/Api';
import Post from '../../components/Post';


function MyProfile() {
    const { user_id } = useParams();
    const [username, setUsername] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [trigger, setTrigger] = useState(false);
    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                const data = await get_user(user_id,user.access_token);
                setUsername(data.data.username);
            } catch (error) {
                console.error('Error fetching user', error);
            }
        };
        cargarUsuario();
        const cargarMisPosts = async () => {
            try {
                
                const data = await getPostsByUser(user_id, user.access_token);
                setPosts(data.data.posts);
            } catch (error) {
                console.error('Error fetching posts', error);
                if (error.response.status === 401) {
                    navigate('/login');
                }
            }
        }
        cargarMisPosts();
    }, [user_id, trigger]);

    const refresh = () => {
        setTrigger(!trigger);
    }


    return (
        <div>
            <h1>Profile</h1>
            <h2>Username: {username}</h2>
            <h2> Posts</h2>
            {posts.map((post) => (
                <Post key={post.id} data={post} onRefresh={refresh} />
            ))}
        </div>
    );
}

export default MyProfile;