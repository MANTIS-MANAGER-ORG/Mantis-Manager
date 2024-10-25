import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { HiCheck, HiX } from 'react-icons/hi';
import { useTicketContext } from '../context/ticketContext';

const RequestList = ({ onSelectRequest }) => {
  const { getRequest, respondeRequest } = useTicketContext(); 
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null); // Reset any previous errors
      try {
        const datos = await getRequest();
        setRequests(datos);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError('Failed to load requests. Please try again.');
      }
      setLoading(false);
    };
    fetchRequests(); 
  }, []);

  if (loading) {
    return <CircularProgress />; // Porbar círculo de carga 
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Verifica si requests es undefined o tiene longitud cero
  if (!requests || requests.length === 0) {
    return null; // No mostrar nada
  }

  const handleResponse = async (id, action) => {
    try {
      const data = await respondeRequest(id, action);
      console.log(data);
      // Actualiza el estado eliminando la solicitud aceptada o rechazada
      setRequests((prevRequests) => prevRequests.filter(request => request.id !== id));
    } catch (error) {
      console.error("Error responding to request:", error);
    }
  };

  return (
    <div className='flex-col justify-center'>
      <table className='justify-center'>
        <thead>
          <tr className='bg-slate-50 border-slate-200'>
            <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">ID</th>
            <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Description</th>
            <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Status</th>
            <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Type</th>
            <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Ticket ID</th>
            <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Fecha</th>
            <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Detalles</th>
            <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {requests
            .filter(request => request.status === 'pendiente')
            .map((request) => (
              <tr key={request.id}>
                <td className="py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700">{request.id}</td>
                <td className="py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700">{request.description}</td>
                <td className="py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700">{request.status}</td>
                <td className="py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700">{request.type}</td>
                <td className="py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700">{request.ticket_id}</td>
                <td className="py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700">{request.created_at}</td>
                <td className='py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700'>
                  <button 
                    onClick={() => onSelectRequest(request)}>Ver detalles</button> {/* Esto se va a borrar */}
                </td>
                <td className='py-4 px-6 text-left border-b border-slate-200 '>
                  <button
                    className="text-green-500 mr-2"
                    onClick={() => handleResponse(request.id, 'aceptada')}
                  >
                    <HiCheck size={20} />
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleResponse(request.id, 'rechazada')}
                  >
                    <HiX size={20} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestList;
