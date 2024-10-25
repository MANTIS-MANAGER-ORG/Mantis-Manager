// En el archivo AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import { useApi } from '../hooks/apiHook';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { fetchApi, loading, error } = useApi();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(0);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const login = async (id, password) => {
    try {
      const data = await fetchApi('https://mantis-manager-production-ce86.up.railway.app/login', 'POST', {
        id,
        password
      });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('user_id', id);

      setIsAuthenticated(true);
      setUserRole(data.data.role_id);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);

      const userImage = await get_Image();
      console.log('Imagen del usuario:', userImage);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    setIsAuthenticated(false);
    setUserRole('');
    setAccessToken('');
    setRefreshToken('');
  };

  const get_Image = async () => {
    const url = `https://mantis-manager-production-ce86.up.railway.app/users/image/${localStorage.getItem('user_id')}`;
    try {
      const data = await fetchApi(url);
      localStorage.setItem('foto', data.path);
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  // Nueva función para cargar la imagen usando fetchApi
  const uploadImage = async (profileImage) => {
    const url = 'https://mantis-manager-production-ce86.up.railway.app/users/upload/admin';
    const formData = new FormData();
    formData.append('file', profileImage);

    try {
      const token = localStorage.getItem('access_token');
      const data = await fetchApi(url, 'POST', formData, {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      });

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      get_Image,
      uploadImage, // Añadir la función al contexto
      isAuthenticated,
      userRole,
      login,
      logout,
      accessToken,
      refreshToken,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
