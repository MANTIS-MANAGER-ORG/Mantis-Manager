import React, { useState } from 'react';
import { useApi } from '../hooks/apiHook';

const MiComponente = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const { fetchPdf, loading, error } = useApi();

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    setInputValue(''); // Resetea el valor del input al cambiar la opción
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleDownload = async () => {
    // Invertimos las fechas para que coincidan con el formato YYYY-MM-DD
    const url = `https://mantis-manager-production-ce86.up.railway.app/admin/obtener_reporte?initial_date=${fechaInicio}&final_date=${fechaFinal}${
      selectedOption === 'maquina' ? `&machine_id=${inputValue}` : 
      selectedOption === 'id creador' ? `&user_id=${inputValue}` : 
      selectedOption === 'id asignado' ? `&assigne_id=${inputValue}` : ''
    }`;

    try {
      const { data, isPdf } = await fetchPdf(url, 'GET');

      if (isPdf) {
        // Crear un enlace para la descarga del PDF
        const urlBlob = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = 'reporte.pdf'; // Nombre del archivo descargado
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(urlBlob); // Liberar la URL del Blob
      }
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Campo de fecha de inicio */}
      <div>
        <label className='text-sm font-normal'>Selecciona Fecha de inicio:</label>
        <input 
          type='date' 
          className='w-1/2 p-2 mt-2 border border-gray-300 rounded'
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          required
        />
      </div>
      
      {/* Campo de fecha final */}
      <div>
        <label className='text-sm font-normal'>Selecciona Fecha Final:</label>
        <input 
          type='date' 
          className='w-1/2 p-2 mt-2 border border-gray-300 rounded'
          value={fechaFinal}
          onChange={(e) => setFechaFinal(e.target.value)}
          required
        />
      </div>

      {/* Selección de opción */}
      <div className="flex items-center">
        <label className="text-sm font-normal mr-2">Selecciona una opción:</label>
        <select
          value={selectedOption}
          onChange={handleSelectChange}
          className="w-1/2 p-2 border border-gray-300 rounded"
        >
          <option value="">Seleccione...</option>
          <option value="maquina">Maquina</option>
          <option value="id creador">Id usuario creado</option>
          <option value="id asignado">Id asignado</option>
        </select>
      </div>

      {/* Campo de entrada para el dato */}
      <div className="flex items-center">
        <label className="text-sm font-normal mr-2">{selectedOption === 'maquina' ? `Ingrese ${selectedOption}` : 'Ingrese Id '}</label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className={`w-1/2 p-2 border border-gray-300 rounded ${!selectedOption ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={selectedOption === 'maquina' ? `Ingrese ${selectedOption}` : 'Ingrese Id '}
          disabled={!selectedOption} // Desactiva la entrada si no hay opción seleccionada
        />
      </div>

      {/* Botón para descargar */}
      <button
        onClick={handleDownload}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={!fechaInicio || !fechaFinal} // Desactiva el botón si no hay fechas
      >
        Descargar
      </button>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default MiComponente;
