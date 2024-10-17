import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { HiCheck, HiX } from 'react-icons/hi';
import { useTicketContext } from '../context/ticketContext';

const RequestList = ({ onSelectRequest }) => {
  const { getRequest,respondeRequest } = useTicketContext(); 
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula la carga de solicitudes
    setLoading(true); // Asegúrate de establecer loading a true antes de la carga
    const fetchRequests = async () => {
      setTimeout(async () => {
        const datos = await getRequest();
        console.log(datos);
        setRequests(datos); // Asegúrate de guardar los datos recibidos
        setLoading(false);
      }, 1000);
    };
  
    fetchRequests(); // Llama a la función de carga
  }, []); // Las dependencias se pueden ajustar según lo necesites
  
  if (loading) {
    return <CircularProgress />;
  }

  const accept = async (id)=>{
    const data = await respondeRequest(id, 'aceptada')
    console.log(data)
   


  }
  const decline =  async (id)=>{
    const data = await respondeRequest(id, 'rechazada')
    console.log(data)


  }




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
          {requests.map((request) => (
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
                  onClick={() => accept(request.id)}
                >
                  <HiCheck size={20} />
                </button>
                <button
                  className="text-red-500"
                  onClick={() => decline(request.id)}
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

