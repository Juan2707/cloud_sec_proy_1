import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className='buttons-container'>
      <h1>Welcome to the Blogging Platform</h1>
      <div className='buttons-box'>
        <Link to="/login"><button>Login</button></Link>
        <Link to="/register"><button>Register</button></Link>
      </div>
    </div>
  );
}

export default Home;
