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

  const recordHistory = (ticketId, action) => {
    const date = new Date().toLocaleDateString();
    setHistory((prevHistory) => [...prevHistory, { date, ticketId, action }]);
  };

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
        "En cola": [...pendientes],
        "Asignado": [...asignados],
        "En proceso": [...enProceso],
      });
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

  const handleCancel = async (ticketId, tab) => {
    const updatedData = { ...ticketsData };
    updatedData[tab] = updatedData[tab].filter((ticket) => ticket.id !== ticketId);
    setTicketsData(updatedData);
    recordHistory(ticketId, "Cancelado");
  };

  const handleEdit = async (editedTicket) => {
    const updatedData = { ...ticketsData };
    Object.keys(updatedData).forEach((tab) => {
      updatedData[tab] = updatedData[tab].map((ticket) =>
        ticket.id === editedTicket.id ? editedTicket : ticket
      );
    });
    setTicketsData(updatedData);
    recordHistory(editedTicket.id, "Editado");
  };

  const toggleGenerarTickets = () => {
    setShowGenerarTickets((prev) => !prev);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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

  const changeTicketState = async (ticketId, newState) => {
    const validStates = ["asignado", "en proceso", "pendiente"];
    if (!validStates.includes(newState)) {
      console.error("Estado no válido:", newState);
      return;
    }

    const url = `http://127.0.0.1:8000/tickets/ticket/${ticketId}/${newState}`;

    try {
      const response = await fetchApi(url, "PATCH");

      if (response.ok) {
        const updatedTicket = await response.json();

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

        console.log("Ticket actualizado:", updatedTicket);
      } else {
        const errorData = await response.json();
        console.error("Error al cambiar el estado del ticket:", errorData);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const AsignedTicket = async (id, assigned) => {
    const url = `http://127.0.0.1:8000/tickets/ticket/assing/${String(id)}?user_id=${String(assigned)}`;

    try {
      const updatedTicket = await fetchApi(url, "PATCH");

      setTicketsData((prevData) => {
        const updatedTickets = { ...prevData };

        // Elimina el ticket de "En cola" y agrégalo a "En proceso"
        updatedTickets["En cola"] = updatedTickets["En cola"].filter((ticket) => ticket.id !== id);
        updatedTickets["En proceso"].push(updatedTicket);

        return updatedTickets;
      });

      console.log('Ticket asignado y movido a "En proceso"');
    } catch (error) {
      console.error("Error al asignar el ticket:", error);
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
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicketContext = () => useContext(TicketContext);

