import React, { createContext, useState, useEffect } from 'react';
import { useApi } from '../hooks/apiHook';

export const MachineContext = createContext();

export const MachineProvider = ({ children }) => {
  const { fetchApi, loading, error } = useApi();
  const [machines, setMachines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState(false);
  const [textQuery, setText] = useState(''); 
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [editingMachineId, setEditingMachineId] = useState(null);  // Para saber cuál máquina se está editando
const [editingMachineData, setEditingMachineData] = useState({});

 // Datos temporales mientras se edita


 const [isEditing, setIsEditing] = useState(false);
 const [editError, setEditError] = useState('');

 const handleEditMachine = (machine) => {
   // If a machine is currently being edited, set an error message
   if (editingMachineId && editingMachineId !== machine.id) {
     setEditError('No se puede editar otra máquina hasta que termines la edición actual.');
     return;
   }

   setEditError(''); // Clear the error message
   setEditingMachineId(machine.id);
   setEditingMachineData({
     ...editingMachineData,
     [machine.id]: {
       serial: machine.serial,
       model: machine.model,
       type: machine.type,
       brand: machine.brand || '',
       description: machine.description || '',
     },
   });
   setIsEditing(true);
 };


  const getMachines = async (query = '') => {
    const url = query
      ? `http://127.0.0.1:8000/machines/machine/${query}`
      : 'http://127.0.0.1:8000/machines/machines';

    try {
      console.log(url);
      const data = await window.api.fetchApi(url, 'GET'); 
      console.log(query);
      console.log(data);
      if (query) {
        setMachines([data] || []);
      } else {
        setMachines(data.machines || []); 
        console.log(data.machines || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const editMachine=async (query, datos)=>{

    const url =`http://127.0.0.1:8000/machines/machine/${query}`;
    console.log(datos);
    console.log(query);
    try{

      const data = await window.api.fetchApi(url, 'PATCH', datos);
      console.log(data);
      getMachines(); // Actualiza la lista después de editar

    }catch(error){
      console.log(error);
    }



  }



  const handleSaveEdit = (machineId) => {
    // Obtenemos los datos editados para la máquina
    const updatedMachineData = editingMachineData[machineId];
  
    // Llama a la función editMachine para actualizar la máquina en el contexto
    console.log(updatedMachineData);
    editMachine(machineId, updatedMachineData);
  
    // Restablecer el estado de edición
    handleCancelEdit(); // Cancelar la edición después de guardar.
  };
  const handleCancelEdit = () => {
    setEditingMachineId(null);
    setEditingMachineData({});
    setIsEditing(false);
  };







  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      if (textQuery) {
        getMachines(textQuery);
      } else {
        getMachines(); 
      }
    }, 300);

    setDebounceTimeout(newTimeout);

    return () => clearTimeout(newTimeout);
  }, [textQuery]);

  const addMachine = async (newMachine) => {
    const url = 'http://127.0.0.1:8000/machines/machine';
    try {
      await window.api.fetchApi(url, 'POST', newMachine); 
      getMachines(); // Actualiza la lista después de añadir
    } catch (error) {
      console.log("Error al añadir la máquina:", error);
    }
    setIsAddMachineModalOpen(false);
  };

  const deleteMachine = async (query) => {
    const url = `http://127.0.0.1:8000/machines/machine/${query}`;
    console.log(query);

    try {
      await window.api.fetchApi(url, 'DELETE');
      // Here you can update the local state to remove the deleted machine
      setMachines((prevMachines) => prevMachines.filter(machine => machine.id !== query)); // Assuming `query` is the machine id
    } catch (error) {
      console.log(error);
    }
  };

  

  const openDetailsModal = (machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
  };

  const handleSearch = (e) => {
    setText(e.target.value);
  };

  return (
    <MachineContext.Provider
      value={{
        machines,
        addMachine,
        deleteMachine,
        
        openDetailsModal,
        closeDetailsModal,
        isModalOpen,
        selectedMachine,
        isAddMachineModalOpen,
        setIsAddMachineModalOpen,
        getMachines, 
        handleSearch,
        textQuery, 
        setText,
        debounceTimeout, 
        setDebounceTimeout,
        editingMachineId, 
        setEditingMachineId,
        editingMachineData, 
        setEditingMachineData,
        editMachine,
        handleSaveEdit,
        handleCancelEdit,
        handleEditMachine,
        isEditing,
        setEditError,
        editError
         //Función para editar una máquina


      }}
    >
      {children}
    </MachineContext.Provider>
  );
};
