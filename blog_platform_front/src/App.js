import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login/Login'; 
import Register from './views/Register/Register';
import Feed from './views/Feed/Feed';
import CreatePost from './views/Feed/CreatePost';
//import EditPost from './views/EditPost';
import { useAuth, AuthProvider } from './components/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  //<Route path="/edit/:postId" element={<PrivateRoute><EditPost /></PrivateRoute> }/>
  return (

    <AuthProvider>
    <Router>
      <div>
        <Routes>
          
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
