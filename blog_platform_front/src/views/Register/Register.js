import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Luego aqui irá el import de un .css
import { register } from '../../services/Api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    // eslint-disable-next-line
    const specialChars = /[!@#$%^&*()-+?_=,<>\/]/;
    return password.length >= minLength && specialChars.test(password);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (password !== passwordConfirmation) {
      alert('Passwords do not match');
      return;
    }
    if (!validatePassword(password)) {
      alert('Password must be at least 8 characters long and contain a special character');
    }
    const response = await register(email, username, password);
    if (response.error) {
      alert(response.message);
      return;
    }
    else{
      alert('Usuario registrado con éxito');
      navigate('/login');
    }
  };

  return (
    <div>
      <h2>Registrarse</h2>
      <form onSubmit={handleRegister}>
        <h3> Ingresa tus datos</h3>
        <label>
          Email:
          <br />
          <input type="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <br />
        <label>
          Usuario:
          <br />
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <br />
        <label>
          Contraseña:
          <br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <label>
          Confirma tu contraseña:
          <br />
          <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
        </label>
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
