import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token del localStorage
    navigate('/login'); // Redirigir al usuario a la página de inicio de sesión
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
};

export default Logout;
