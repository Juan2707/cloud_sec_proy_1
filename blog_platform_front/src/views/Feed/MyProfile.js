import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { get_my_user, getPostsByUser } from '../../services/Api';
import MyPost from '../../components/MyPost';


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
                const data = await get_my_user(user.access_token);
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
            <h1>Mi perfil</h1>
            <button onClick={() =>navigate('/feed')}>Regresar al inicio</button>
            <h2>Nombre de usuario: {username}</h2>
            <h2> Mis Posts:</h2>
            {posts.map((post) => (
                <MyPost key={post.id} data={post} onRefresh={refresh} />
            ))}
        </div>
    );
}

export default MyProfile;