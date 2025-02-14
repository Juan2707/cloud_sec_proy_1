import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login'; 
import Register from './views/Register';
import Feed from './views/Feed';
import CreatePost from './views/CreatePost';
import EditPost from './views/EditPost';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/edit/:postId" element={<EditPost />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} /> {/* Actualización aquí */}
          {/* Futuras rutas aquí */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
