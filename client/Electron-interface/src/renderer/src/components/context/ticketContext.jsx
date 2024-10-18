import React, { createContext, useState, useContext, useEffect } from "react";
import { useApi } from "../hooks/apiHook"; // Hook para la API

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const { fetchApi, loading, error } = useApi();
  const [ticketsData, setTicketsData] = useState({
    "En cola": [],
    "Asignado": [],
    "En proceso": [],
  });
  const [showGenerarTickets, setShowGenerarTickets] = useState(false);
  const [history, setHistory] = useState([]);
  const [page, setCurrentPage] = useState(1);
  const [hasMoreTickets, setHasMoreTickets] = useState(true);
  const [activeSession, setActiveSection] = useState(null); 

  // Función para registrar historial
  const recordHistory = (ticketId, action) => {
    const date = new Date().toLocaleDateString();
    setHistory((prevHistory) => [...prevHistory, { date, ticketId, action }]);
  };

  // Función para cargar los tickets desde el backend
  const fetchTickets = async (page = 1, limit = 10) => {
    const url = `http://127.0.0.1:8000/tickets/tickets?page=${page}&limit=${limit}`;

    try {
      const data = await fetchApi(url, "GET");
      const pendientes = data.tickets.filter((ticket) => ticket.state === "pendiente");
      const enProceso = data.tickets.filter((ticket) => ticket.state === "en proceso");
      const asignados = data.tickets.filter((ticket) => ticket.state === "asignado");

      const moreTickets = data.tickets.length === limit;
      setHasMoreTickets(moreTickets);

      setTicketsData({
        "En cola": pendientes,
        "Asignado": asignados,
        "En proceso": enProceso,
      });
    } catch (error) {
      console.error("Error al cargar los tickets:", error);
    }
  };

  // Función para agregar un nuevo ticket
  const handleAddTicket = async (newTicket) => {
    const ticketData = {
      description: newTicket.description,
      machine: newTicket.machine,
      priority: newTicket.priority,
    };
    const url = "http://127.0.0.1:8000/tickets/ticket";

    try {
      const createdTicket = await fetchApi(url, "POST", ticketData);
      setTicketsData((prevData) => ({
        ...prevData,
        "En cola": [...prevData["En cola"], createdTicket],
      }));
      recordHistory(createdTicket.id, "Creado");
    } catch (error) {
      console.error("Error al crear el ticket:", error);
    }
  };

  // Función para cancelar un ticket
  const handleCancel = async (ticketId, tab) => {
    try {
      setTicketsData((prevData) => ({
        ...prevData,
        [tab]: prevData[tab].filter((ticket) => ticket.id !== ticketId),
      }));
      recordHistory(ticketId, "Cancelado");
    } catch (error) {
      console.error("Error al cancelar el ticket:", error);
    }
  };

  // Función para editar un ticket
  const handleEdit = async (editedTicket) => {
    try {
      setTicketsData((prevData) => ({
        ...prevData,
        ...Object.keys(prevData).reduce((updatedData, tab) => {
          updatedData[tab] = prevData[tab].map((ticket) =>
            ticket.id === editedTicket.id ? editedTicket : ticket
          );
          return updatedData;
        }, {}),
      }));
      recordHistory(editedTicket.id, "Editado");
    } catch (error) {
      console.error("Error al editar el ticket:", error);
    }
  };

  // Función para cambiar el estado de un ticket
  const changeTicketState = async (ticketId, newState) => {
    const validStates = ["asignado", "en proceso", "pendiente"];
    if (!validStates.includes(newState)) {
      console.error("Estado no válido:", newState);
      return;
    }

    const url = `http://127.0.0.1:8000/tickets/ticket/${ticketId}/${newState}`;

    try {
      const updatedTicket = await fetchApi(url, "PATCH");

      setTicketsData((prevData) => {
        const updatedTickets = { ...prevData };

        // Elimina el ticket de su estado actual
        Object.keys(updatedTickets).forEach((tab) => {
          updatedTickets[tab] = updatedTickets[tab].filter((ticket) => ticket.id !== ticketId);
        });

        // Añade el ticket al nuevo estado
        if (newState === "pendiente") {
          updatedTickets["En cola"].push(updatedTicket);
        } else if (newState === "en proceso") {
          updatedTickets["En proceso"].push(updatedTicket);
        } else if (newState === "asignado") {
          updatedTickets["Asignado"].push(updatedTicket);
        }

        return updatedTickets;
      });
    } catch (error) {
      console.error("Error al cambiar el estado del ticket:", error);
    }
  };

  // Función para asignar un ticket
  const AsignedTicket = async (id, assigned) => {
    const url = `http://127.0.0.1:8000/tickets/ticket/assing/${id}?user_id=${assigned}`;

    try {
      const updatedTicket = await fetchApi(url, "PATCH");

      setTicketsData((prevData) => ({
        ...prevData,
        "En cola": prevData["En cola"].filter((ticket) => ticket.id !== id),
        "En proceso": [...prevData["En proceso"], updatedTicket],
      }));

      console.log('Ticket asignado y movido a "En proceso"');
    } catch (error) {
      console.error("Error al asignar el ticket:", error);
    }
  };

  // Función para crear una solicitud de cierre o reapertura
  const createRequest = async (ticketId, description, type) => {
    const requestData = {
      description,
      type, // 'cierre' o 'apertura'
      ticket_id: ticketId,
    };

    const url = "http://127.0.0.1:8000/solicitudes";

    try {
      const createdRequest = await fetchApi(url, "POST", requestData);
      console.log("Solicitud creada:", createdRequest);
      return createdRequest;
    } catch (error) {
      console.error("Error al crear la solicitud:", error);
    }
  };

  // Función para obtener solicitudes
  const getRequest = async (id = null) => {
    const url = id
      ? `http://127.0.0.1:8000/solicitudes/${id}`
      : `http://127.0.0.1:8000/solicitudes`;

    try {
      const data = await fetchApi(url, "GET");
      return data;
    } catch (error) {
      console.error("Error al obtener las solicitudes:", error);
    }
  };

  // Función para responder solicitudes
  const respondeRequest = async (id, response) => {
    const url = `http://127.0.0.1:8000/solicitudes/${id}/responder`;
    const body = {
      status: response,
    };

    try {
      await fetchApi(url, "PATCH", body);
      console.log("La solicitud se respondió con éxito");
    } catch (error) {
      console.error("Error al responder la solicitud:", error);
    }
  };

  const toggleGenerarTickets = () => {
    setShowGenerarTickets((prev) => !prev);
  };

  // Efecto para cargar tickets al montar el componente
  useEffect(() => {
    fetchTickets();
  }, [activeSession]);

  const handlePageR = () => {
    if (!hasMoreTickets) return;
    const nextPage = page + 1;
    setCurrentPage(nextPage);
    fetchTickets(nextPage);
  };

  const handlePageL = () => {
    if (page > 1) {
      const nextPage = page - 1;
      setCurrentPage(nextPage);
      fetchTickets(nextPage);
    }
  };

  return (
    <TicketContext.Provider
      value={{
        ticketsData,
        handleAddTicket,
        handleCancel,
        handleEdit,
        showGenerarTickets,
        toggleGenerarTickets,
        history,
        page,
        setCurrentPage,
        handlePageR,
        handlePageL,
        loading,
        hasMoreTickets,
        AsignedTicket,
        changeTicketState,
        createRequest,
        getRequest,
        respondeRequest,
        activeSession, 
        setActiveSection
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicketContext = () => useContext(TicketContext);
