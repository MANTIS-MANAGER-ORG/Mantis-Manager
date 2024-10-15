import React, { useContext, useState } from 'react';
import { MachineContext } from '../context/MachineContext';
import MachineForm from './machineForm';
import MachineDetailsModal from './MachineModal';
import { HiSearch } from 'react-icons/hi';

const MachineList = () => {
  const {
    machines,
    addMachine,
    deleteMachine,
    toggleMachineStatus,
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
  } = useContext(MachineContext);


  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-10 text-indigo-700">Inventario de Máquinas</h1>

      {/* Error message for editing */}
      {editError && (
        <div className="mb-4 text-red-500 text-center">
          {editError}
        </div>
      )}

      {/* Contenedor para el botón de búsqueda y campo de entrada */}
      <div className='flex mb-4'>
        <button onClick={() => handleSearch(textQuery)}><HiSearch /></button>
        <input
          type="text"
          placeholder="Buscar por id o texto"
          value={textQuery}
          onChange={e => setText(e.target.value)} // Actualiza textQuery al escribir
          className="ml-2 border rounded p-2"
        />
      </div>

      {/* Modal para agregar máquina */}
      {isAddMachineModalOpen && (
        <MachineForm addMachine={addMachine} closeModal={() => setIsAddMachineModalOpen(false)} />
      )}

      {/* Tabla de máquinas */}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-indigo-600 text-white">
            <th className="py-3 px-4 text-center">Serial</th>
            <th className="py-3 px-4 text-center">Modelo</th>
            <th className="py-3 px-4 text-center">Tipo</th>
            <th className="py-3 px-4 text-center">Marca</th>
            <th className="py-3 px-4 text-center">Descripción</th>
            <th className="py-3 px-4 text-center">Función</th>
            <th className="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine, index) => (
            <tr key={index} className="border-b hover:bg-gray-100">
              <td className="py-3 text-center">
                {editingMachineId === machine.id ? (
                  <input
                    className='border rounded-md border-red-100 bg-blue-100'
                    type="text"
                    value={editingMachineData[machine.id]?.serial || ''}
                    onChange={e =>
                      setEditingMachineData({
                        ...editingMachineData,
                        [machine.id]: { ...editingMachineData[machine.id], serial: e.target.value },
                      })
                    }
                  />
                ) : (
                  machine.serial
                )}
              </td>
              <td className="py-3 text-center">
                {editingMachineId === machine.id ? (
                  <input
                    className='border rounded-md border-red-100 bg-blue-100'
                    type="text"
                    value={editingMachineData[machine.id]?.model || ''}
                    onChange={e =>
                      setEditingMachineData({
                        ...editingMachineData,
                        [machine.id]: { ...editingMachineData[machine.id], model: e.target.value },
                      })
                    }
                  />
                ) : (
                  machine.model
                )}
              </td>
              <td className="py-3 text-center">
                {editingMachineId === machine.id ? (
                  <input
                    className='border rounded-md border-red-100 bg-blue-100'
                    type="text"
                    value={editingMachineData[machine.id]?.type || ''}
                    onChange={e =>
                      setEditingMachineData({
                        ...editingMachineData,
                        [machine.id]: { ...editingMachineData[machine.id], type: e.target.value },
                      })
                    }
                  />
                ) : (
                  machine.type
                )}
              </td>
              <td className="py-3 text-center">
                {editingMachineId === machine.id ? (
                  <input
                    className='border rounded-md border-red-100 bg-blue-100'
                    type="text"
                    value={editingMachineData[machine.id]?.brand || ''}
                    onChange={e =>
                      setEditingMachineData({
                        ...editingMachineData,
                        [machine.id]: { ...editingMachineData[machine.id], brand: e.target.value },
                      })
                    }
                  />
                ) : (
                  machine.brand || 'N/A'
                )}
              </td>
              <td className="py-3 text-center">
                {editingMachineId === machine.id ? (
                  <input
                    className='border rounded-md border-red-100 bg-blue-100'
                    value={editingMachineData[machine.id]?.description || ''}
                    onChange={e =>
                      setEditingMachineData({
                        ...editingMachineData,
                        [machine.id]: { ...editingMachineData[machine.id], description: e.target.value },
                      })
                    }
                  />
                ) : (
                  machine.description || 'N/A'
                )}
              </td>
              <td className="py-3 text-center">
                {editingMachineId === machine.id ? (
                  <input
                    className='border rounded-md border-red-100 bg-blue-100'
                    value={editingMachineData[machine.id]?.description || ''}
                    onChange={e =>
                      setEditingMachineData({
                        ...editingMachineData,
                        [machine.id]: { ...editingMachineData[machine.id], description: e.target.value },
                      })
                    }
                  />
                ) : (
                  machine.action || 'N/A'
                )}
              </td>
              <td className="py-3 text-right">
                <button onClick={(e) => { e.stopPropagation(); deleteMachine(machine.id); }} className="text-white bg-red-500 rounded-lg p-2 gap-4">
                  Eliminar
                </button>

                {/* Botón para abrir el modal de detalles. dejo el modal por si se rquiere utilizar para algo más  */}
                

                {editingMachineId === machine.id ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(machine.id); }} className="ml-2 bg-green-600 text-white rounded-lg p-2 ">
                      Enviar
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); setEditError(''); }} className="ml-2 bg-gray-400 text-white rounded-lg p-2 ">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleEditMachine(machine)} className='ml-2 bg-indigo-600 text-white rounded-lg p-2 '>
                    Editar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para ver detalles de la máquina */}
      {isModalOpen && selectedMachine && (
        <MachineDetailsModal machine={selectedMachine} closeModal={closeDetailsModal} />
      )}

      <button
        onClick={() => setIsAddMachineModalOpen(true)}
        className="mb-8 p-4 bg-indigo-600 text-white text-right"
      >
        Agregar Máquina
      </button>
    </div>
  );
};

export default MachineList;
