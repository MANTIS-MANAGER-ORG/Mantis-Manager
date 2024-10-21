import React, { useState, useEffect } from 'react'
import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiSearch,
  HiOutlineEye,
  HiArrowLeft,
  HiArrowRight
} from 'react-icons/hi'
import { useAuth } from '../context/authContext'

const UserManagement = () => {
  const { register } = useAuth()
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '', // nuevo campo para confirmar la contraseña
    role_id: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserHistory, setSelectedUserHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [originalData, setOriginalData] = useState({})

  const handlePageR = () => {
    setCurrentPage(currentPage + 1)
    console.log(currentPage)
  }
  const handlePageL = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      // Obtener el token de acceso del localStorage
      const token = localStorage.getItem('access_token')
      console.log(token)
      if (!token) {
        throw new Error('No se encontró el token de acceso')
      }

      // Construir la URL con los parámetros de paginación
      const url = `https://mantis-manager-production-ce86.up.railway.app/jefe_desarrollo/user_info?page=${page}&limit=${limit}`

      // Realizar la solicitud a la API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Usar el token aquí
          'Content-Type': 'application/json'
        }
      })

      // Comprobar si la respuesta fue exitosa
      if (!response.ok) {
        const errorData = await response.json()
        console.log('Error al obtener usuarios:', errorData)
        throw new Error(errorData.detail ? errorData.detail[0].msg : 'Error al obtener usuarios')
      }

      // Parsear la respuesta JSON
      const data = await response.json()
      console.log(data.users)

      setUsers(data.users) // Ajusta según la estructura de la respuesta real
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error // Vuelve a lanzar el error para que pueda ser manejado en otro lugar
    }
  }

  // Ejemplo de uso
  useEffect(() => {
    fetchUsers(currentPage, 10)
    console.log('hola')
  }, [currentPage])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddUser = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden.')
      return
    }
    // Validar si es un nuevo usuario (todos los campos requeridos)
    if (
      !isEditing &&
      (!formData.id ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.role ||
        !formData.password ||
        !formData.phone)
    ) {
      alert('Por favor, completa todos los campos')
      return
    }

    if (isEditing) {
      // Crear un objeto vacío para almacenar solo los campos modificados
      const updatedUser = {}

      if (formData.id !== originalData.id) {
        alert('No puedes cambiar el ID de un usuario.')
        return
      }
      // Comparar cada campo con los valores originales
      if (formData.firstName !== originalData.firstName) updatedUser.first_name = formData.firstName
      if (formData.lastName !== originalData.lastName) updatedUser.last_name = formData.lastName
      if (formData.email !== originalData.email) updatedUser.email = formData.email
      if (parseInt(formData.role, 10) !== originalData.role)
        updatedUser.role_id = parseInt(formData.role, 10)
      if (formData.password) updatedUser.password = formData.password // Solo agregar si se cambió la contraseña
      if (formData.phone !== originalData.phone) updatedUser.phone = formData.phone

      if (Object.keys(updatedUser).length === 0) {
        alert('No has realizado ningún cambio.')
        return
      }

      console.log(JSON.stringify(updatedUser))
      const token = localStorage.getItem('access_token')
      // Realizar el fetch a la URL con el ID dinámico
      try {
        const response = await fetch(
          `https://mantis-manager-production-ce86.up.railway.app/jefe_desarrollo/user_info/${formData.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` // Añadir el token aquí
            },
            body: JSON.stringify(updatedUser)
          }
        )

        if (!response.ok) {
          throw new Error('Error al actualizar el usuario')
        }

        const result = await response.json()
        console.log('Usuario actualizado:', result)
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === result.id ? { ...user, ...result } : user))
        )
      } catch (error) {
        console.error('Error al actualizar el usuario:', error)
      }
      setIsEditing(false)
      setSelectedUserId(null)
    } else {
      try {
        // Si no es edición, agregar un nuevo usuario
        const newUser = await register(
          formData.id,
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.phone,
          formData.password,
          parseInt(formData.role, 10)
        )

        console.log('Nuevo usuario registrado:', newUser)
        fetchUsers(currentPage, 10)
      } catch (error) {
        console.error('Error al registrar el usuario:', error)
        alert('Error al registrar el usuario. Por favor, intenta de nuevo.')
      }
    }

    setFormData({
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      password: '',
      phone: ''
    })
  }

  const handleEditUser = (user) => {
    setFormData({
      id: user.id, // Asigna el ID del usuario a editar
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role_id,
      password: user.password,
      phone: user.phone
    })
    setOriginalData({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role_id,
      password: '', // Puede estar vacío o un valor fijo
      phone: user.phone
    })
    setIsEditing(true)
    setSelectedUserId(user.id)
  }

  const handleDeleteUser = async (userId) => {
    try {
      // Llamada al endpoint para eliminar el usuario
      const token = localStorage.getItem('access_token')
      const response = await fetch(`https://mantis-manager-production-ce86.up.railway.app/jefe_desarrollo/user_info/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Agrega aquí tu token de autenticación si es necesario
          Authorization: `Bearer ${token}` // Asegúrate de tener el token disponible
        }
      })

      if (response.ok) {
        // Si la respuesta es exitosa, filtra el usuario eliminado
        setUsers(users.filter((user) => user.id !== userId))
      } else {
        const errorData = await response.json()
        console.error('Error al eliminar el usuario:', errorData.error)
        // Manejar el error según sea necesario (mostrar un mensaje al usuario, etc.)
      }
    } catch (error) {
      console.error('Error de red:', error)
      // Manejar el error de red (mostrar un mensaje al usuario, etc.)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase())
  }
  //filtrado de usuarios para busqueda
  const filteredUsers = users.filter((user) => {
    return (
      user.first_name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery) ||
      user.last_name.toLowerCase().includes(searchQuery)
    )
  })

  const handleShowHistory = (user) => {
    setSelectedUserHistory(user.history)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUserHistory([])
  }

  const roleMap = {
    1: 'Jefe de desarrollo',
    2: 'Operario de mantenimiento',
    3: 'Operario de Maquinaria',
    4: 'Jefe de mantenimiento'
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Gestión de Usuarios</h1>

      <div className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          {isEditing ? 'Editar Usuario' : 'Agregar Usuario'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="id"
            placeholder="ID"
            value={formData.id || ''}
            onChange={handleInputChange}
            readOnly={isEditing}
            disabled={isEditing}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="firstName"
            placeholder="Nombre"
            value={formData.firstName || ''}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Apellido"
            value={formData.lastName || ''}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="role"
            value={formData.role || ''}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Selecciona un rol
            </option>
            <option value={2}>Operario de mantenimiento</option>
            <option value={1}>Jefe de desarrollo</option>
            <option value={3}>Operario de Maquinaria</option>
            <option value={4}>Jefe de mantenimiento</option>
          </select>
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password || ''}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={!isEditing}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Teléfono"
            value={formData.phone || ''}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword || ''}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={!isEditing}
          />
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleAddUser}
            className="bg-blue-500 text-white rounded-lg px-6 py-2 hover:bg-blue-600 transition duration-300 flex items-center space-x-2"
          >
            <HiPlus />
            <span>{isEditing ? 'Actualizar' : 'Agregar'}</span>
          </button>
        </div>
      </div>

      <div className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Buscar Usuarios</h2>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={handleSearch}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-col items-center align-middle">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600">
              <th className="p-4 md:p-2 text-left">Nombre</th>
              <th className="p-4 md:p-2 text-left">Correo</th>
              <th className="p-4 md:p-2 text-left">Rol</th>
              <th className="p-4 md:p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={index + 1} className="border-b border-gray-300">
                  <td className="p-4 md:p-2 pl-4">{`${user.first_name} ${user.last_name}`}</td>
                  <td className="p-4 md:p-2">{user.email}</td>
                  <td className="p-4 md:p-2">{roleMap[user.role_id] || 'Rol desconocido'}</td>
                  <td className="p-4 md:p-2 flex space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-500 hover:underline"
                    >
                      <HiPencil />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-500 hover:underline"
                    >
                      <HiTrash />
                    </button>
                    <button
                      onClick={() => handleShowHistory(user)}
                      className="text-green-500 hover:underline"
                    >
                      <HiOutlineEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex p-4 ">
          <HiArrowLeft onClick={handlePageL} />
          <HiArrowRight className="items-start" onClick={handlePageR} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h3 className="text-lg font-bold mb-4">Historial de Usuario</h3>
            <ul>
              {selectedUserHistory?.length > 0 ? (
                selectedUserHistory.map((item, index) => (
                  <li key={index} className="border-b border-gray-300 p-2">
                    {item.action} - {item.date}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No history available for this user</li>
              )}
            </ul>

            <button
              onClick={handleCloseModal}
              className="mt-4 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
