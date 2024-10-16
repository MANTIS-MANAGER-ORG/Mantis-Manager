// src/context/TicketContext.js
import React, { createContext, useState, useContext } from "react";
import { useApi } from "../hooks/apiHook"; // Importar el hook de API
// revisar documentación par< implmentar usecallback para un mayor rendimiento 
// Crear el contexto
const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const { fetchApi , loading, error } = useApi(); // Usar el hook de API
  const [ticketsData, setTicketsData] = useState({ "En cola": [], "En proceso": [], "Terminados": [] });
  const [showGenerarTickets, setShowGenerarTickets] = useState(false);
  const [history, setHistory] = useState([]);
  
  const recordHistory = (ticketId, action) => {
    const date = new Date().toLocaleDateString();
    setHistory(prevHistory => [...prevHistory, { date, ticketId, action }]);
  };

  const fetchTickets = async () => {
    const page=parseInt(1)
    const limit=parseInt(10)
    const url = `http://127.0.0.1:8000/tickets/tickets?page=${page}&limit=${limit}`;

    try {
      const data = await fetchApi(url, 'GET'); // Usar el hook de API
  
      const pendientes = data.tickets.length > 0 ? data.tickets.filter(i => i.state === "pendiente") : [];

      setTicketsData(prevTickets => ({
        ...prevTickets,
        "En cola": [...pendientes],
        "En proceso": [],
        "Terminados": [] 
      }));
    } catch (error) {
      console.error("Error al cargar los tickets:", error);
    }
  };

  const handleAddTicket = async (newTicket) => {
    const ticketData = {
      description: newTicket.description,
      machine: newTicket.machine,
      priority: newTicket.priority,
    };

    const url = "http://127.0.0.1:8000/tickets/ticket"; // URL de la API

    try {
      console.log(ticketData);
      const createdTicket = await fetchApi(url, 'POST', ticketData); // Usar el hook de API
      setTicketsData(prevData => ({
        ...prevData,
        "En cola": [...prevData["En cola"], createdTicket]
      }));
      recordHistory(createdTicket.id, 'Creado');
    } catch (error) {
      console.error("Error al crear el ticket:", error);
    }
  };

  const handleCancel = async (ticketId, tab) => {
    const updatedData = { ...ticketsData };
    updatedData[tab] = updatedData[tab].filter(ticket => ticket.id !== ticketId);
    setTicketsData(updatedData); // Actualizar el estado local
    recordHistory(ticketId, 'Cancelado');
  };

  const handleEdit = async (editedTicket) => {
    const updatedData = { ...ticketsData };
    Object.keys(updatedData).forEach(tab => {
      updatedData[tab] = updatedData[tab].map(ticket =>
        ticket.id === editedTicket.id ? editedTicket : ticket
      );
    });
    setTicketsData(updatedData); // Actualizar el estado local
    recordHistory(editedTicket.id, 'Editado');
  };

  const toggleGenerarTickets = () => {
    setShowGenerarTickets(prev => !prev);
  };

  React.useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <TicketContext.Provider value={{
      ticketsData,
      handleAddTicket,
      handleCancel,
      handleEdit,
      showGenerarTickets,
      toggleGenerarTickets,
      history
    }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTicketContext = () => useContext(TicketContext);


