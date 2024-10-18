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
    return <CircularProgress />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (requests.length === 0) {
    return <div className="text-gray-500">No pending requests available.</div>;
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
    <div className='flex-col'>
      <h2 className='text-red-300'>Request List</h2>
      <table>
        <thead>
          <tr>
            <th className="py-4 px-6 text-left">ID</th>
            <th className='py-4 px-6 text-left'>Description</th>
            <th className='py-4 px-6 text-left'>Status</th>
            <th className='py-4 px-6 text-left'>Type</th>
            <th className='py-4 px-6 text-left'>Ticket ID</th>
            <th className='py-4 px-6 text-left'>Fecha</th>
            <th className='py-4 px-6 text-left'>Detalles</th>
            <th className='py-4 px-6 text-left'>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {requests
            .filter(request => request.status === 'pendiente')
            .map((request) => (
              <tr key={request.id}>
                <td className="py-4 px-6 text-left">{request.id}</td>
                <td className="py-4 px-6 text-left">{request.description}</td>
                <td className="py-4 px-6 text-left">{request.status}</td>
                <td className="py-4 px-6 text-left">{request.type}</td>
                <td className="py-4 px-6 text-left">{request.ticket_id}</td>
                <td className="py-4 px-6 text-left">{request.created_at}</td>
                <td>
                  <button onClick={() => onSelectRequest(request)}>Ver detalles</button>
                </td>
                <td className="py-4 px-6 text-left">
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
