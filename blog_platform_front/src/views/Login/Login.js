import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Aqui iria el import de css
import { login } from '../../services/Api';
import { useAuth } from '../../components/AuthContext';
// Tambien componentes del auth context para prevenir sql injection

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const handleSubmit =  async (event) => {
    event.preventDefault();
    // Aquí iría la lógica para verificar las credenciales
    const response = await login(email, password);
    if (response.error) {
      alert(response.message);
      return;
    }
    else{
      handleLogin(response.data);
      navigate('/feed');}
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <br />
        <label>
          Contraseña:
          <br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <h2>Aún no tienes cuenta?</h2>
      <button onClick={() => navigate('/register')}>Regístrate</button>
    </div>
  );
}

export default Login;
