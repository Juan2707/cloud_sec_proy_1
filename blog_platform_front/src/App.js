import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login/Login'; 
import Register from './views/Register/Register';
import Feed from './views/Feed/Feed';
import CreatePost from './views/Feed/CreatePost';
import MyProfile from './views/Feed/MyProfile';
import ThirdPersonProfile from './views/Feed/ThirdPersonProfile';
import EditPost from './views/Feed/EditPost';
import DetailedPost from './components/DetailedPost';
import { useAuth, AuthProvider } from './components/AuthContext';

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
          <Route path="/profile/:user_id" element={<PrivateRoute><ThirdPersonProfile /></PrivateRoute>} />
          <Route path="/post/:post_id" element={<PrivateRoute><DetailedPost /></PrivateRoute>} />
          <Route path="/editpost/:post_id" element={<PrivateRoute><EditPost /></PrivateRoute>} />
          <Route path="/myprofile/:user_id" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} /> {/* Actualización aquí */}
          {/* Futuras rutas aquí */}
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
