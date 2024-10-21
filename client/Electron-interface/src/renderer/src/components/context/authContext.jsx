import React, { createContext, useState, useContext } from 'react';
import { useApi } from '../hooks/apiHook'; // Importamos el custom hook

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { fetchApi, loading, error } = useApi(); // Usamos el custom hook
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

      // Guardar tokens y datos del usuario en localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('user_id', id);

      // Actualizar el estado de autenticación
      setIsAuthenticated(true);
      setUserRole(data.data.role_id);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);

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

  const register = async (id, first_name, last_name, email, phone, password, role) => {
    try {
      const data = await fetchApi('https://mantis-manager-production-ce86.up.railway.app/jefe_desarrollo/register', 'POST', {
        id,
        first_name,
        last_name,
        email,
        phone: phone.toString(),
        password,
        role
      });

      console.log(data.data);
      return data.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userRole,
      login,
      logout,
      register,
      accessToken,
      refreshToken,
      loading, // Puedes usar loading y error en los componentes
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
