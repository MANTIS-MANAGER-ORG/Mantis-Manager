// En el archivo Perfil.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Perfil = () => {
  const [name, setName] = useState('Juan Pérez');
  const [email, setEmail] = useState('juan.perez@example.com');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const { logout, uploadImage } = useAuth();
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!profileImage) {
      alert('Por favor selecciona una imagen');
      return;
    }

    try {
      const response = await uploadImage(profileImage);
      console.log('Respuesta de la API:', response);
      alert('Cambios guardados');
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('profileImageInput').click();
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg p-6">
        <section className="mb-8">
          <div className="flex items-center mb-6">
            <div className="relative w-32 h-32">
              <img
                src="/default-profile.png"
                alt="Perfil"
                className="w-full h-full object-cover rounded-full cursor-pointer"
                onClick={triggerFileInput}
              />
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center"
                title="Cambiar Foto"
              >
                <span className="material-icons">camera_alt</span>
              </button>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Foto de Perfil</h2>
              <p className="text-gray-600">Haz clic en la imagen para cambiarla.</p>
            </div>
          </div>
        </section>

        {/* Sección de información personal y cambio de contraseña (sin cambios) */}
        
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 mr-4"
        >
          Guardar Cambios
        </button>
        
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Perfil;
