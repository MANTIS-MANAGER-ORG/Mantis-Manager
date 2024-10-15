import React, { useState } from 'react';

const MachineForm = ({ addMachine, closeModal }) => {
  const [formData, setFormData] = useState({
    id: '',
    type: '',
    brand: '',
    model: '',
    serial: '',
    description: '',
    action: '', // Solo una vez
  });




  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    const newMachine = { 
      id: formData.id,
      type: formData.type,
      brand: formData.brand,
      model: formData.model,
      serial: formData.serial,
      description: formData.description,
      action: formData.action, // Solo una vez


    };
    console.log(newMachine);

    try {
      await addMachine(newMachine); // Asegúrate de que addMachine maneje correctamente la promesa
      // Reiniciar el formulario
      setFormData({
        id: '',
        type: '',
        brand: '',
        model: '',
        serial: '',
        description: '',
        action: '',
      });
      closeModal();
    } catch (error) {
      console.error("Error al agregar la máquina:", error); // Manejar el error si es necesario
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative z-50">
        <h2 className="text-2xl font-semibold mb-4">Agregar Máquina</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className="block text-gray-700">ID</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => handleChange('id', e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Tipo</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Marca</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className='mb-4'> {/* Corrección de 'di' a 'div' */}
            <label className="block text-gray-700">Modelo</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Serial</label>
            <input
              type="text"
              value={formData.serial}
              onChange={(e) => handleChange('serial', e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className='mb-4'>
            <label className="block text-gray-700">Acción</label>
            <select
              
              value={formData.action}
              onChange={(e) => handleChange('action', e.target.value)}// e.target,value
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Seleccione una acción</option>
              <option value="tejer">Tejer</option>
              <option value="teñir">Teñir</option>
              <option value="urdir">Urdir</option>
              <option value="fijar">Fijar</option>
            </select>


          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-800 transition"
            >
              Agregar Máquina
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="ml-2 p-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineForm;
