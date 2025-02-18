import React from "react";
import { useAuth } from "./AuthContext";

function LogOutComponent({ onLogin }) {
    const { user, handleLogout} = useAuth();

    if(!user){
        localStorage.removeItem('token');
        return null;
    }
    const cerrarSesion = () => {
        handleLogout()
        localStorage.removeItem('token');
    };
  
    return <button onClick={cerrarSesion}>Cerrar Sesión</button>;
  }

  export default LogOutComponent;