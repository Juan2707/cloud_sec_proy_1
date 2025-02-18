import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login/Login'; 
import Register from './views/Register/Register';
import Feed from './views/Feed/Feed';
import CreatePost from './views/CreatePost';
import EditPost from './views/EditPost';
import { useAuth, AuthProvider } from './components/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
