import React from 'react';
import DeveloperSection from './developer_content';
import FeatureCard from './featureCard';
import Tech_component from './Tech_componet';

const BoardContent = () => {
  const features = [
    { 
      title: 'Reporte de Daños y Mantenimientos', 
      description: 'Permite a los usuarios generar tickets de mantenimiento de manera rápida y sencilla.', 
      category: 'mantenimiento',
      details: 'Este módulo facilita el registro de incidencias y su seguimiento desde la creación del ticket hasta su resolución.'
    },
    { 
      title: 'Gestión de Tickets', 
      description: 'Los técnicos pueden ver y gestionar los tickets asignados a su especialidad.', 
      category: 'tickets',
      details: 'Permite filtrar y asignar tickets de manera eficiente para optimizar los tiempos de respuesta.'
    },
    { 
      title: 'Historial de Mantenimientos', 
      description: 'Registro de todos los mantenimientos realizados, con detalles de intervenciones.', 
      category: 'configuración',
      details: 'Proporciona un seguimiento exhaustivo de las intervenciones pasadas para análisis futuros.'
    },
    { 
      title: 'Planificación de Mantenimiento Preventivo', 
      description: 'Programa mantenimientos preventivos según el uso de las máquinas.', 
      category: 'tickets',
      details: 'Facilita la planificación a largo plazo, reduciendo el riesgo de fallos inesperados.'
    },
    { 
      title: 'Gestión de Inventario de Repuestos', 
      description: 'Control del inventario de repuestos necesarios para el mantenimiento.', 
      category: 'configuración',
      details: 'Permite mantener un registro actualizado de las piezas disponibles y realizar pedidos de manera eficiente.'
    },
    { 
      title: 'Notificaciones y Alertas', 
      description: 'Envía notificaciones automáticas sobre tickets y vencimientos de mantenimiento.', 
      category: 'configuracion',
      details: 'Asegura que todos los involucrados estén al tanto de los eventos críticos en tiempo real.'
    },
    { 
      title: 'Reportes y Análisis', 
      description: 'Genera reportes detallados sobre rendimiento y tiempos de inactividad.', 
      category: 'reportes',
      details: 'Facilita la toma de decisiones informadas a través del análisis de datos históricos.'
    },
    { 
      title: 'Gestión de Usuarios y Roles', 
      description: 'Administra los permisos de acceso de los usuarios.', 
      category: 'usuarios',
      details: 'Permite establecer roles y permisos específicos, garantizando la seguridad y la confidencialidad de la información.'
    }
  ];

  return (
    <div className="main-content  min-h-screen p-6 bg-">
      <div className="max-w-7xl mx-auto bg-white rounded-lg  p-6">
        <h1 className="text-4xl font-bold text-gray-800  darkMode:text-white mb-6">Mantis Manager</h1>
        <p className="text-lg text-gray-600 mb-8">
          Mantis Manager es un software de gestión de mantenimiento diseñado para mejorar la organización y eficiencia en la gestión de mantenimientos y reparaciones de máquinas en una empresa.
        </p>
        
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Funcionalidades del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              title={feature.title} 
              description={feature.description} 
              category={feature.category}
              details={feature.details} 
            />
          ))}
        </div>

        <div className="mt-12">
          <DeveloperSection />
        </div>
        <div>
            <Tech_component />

        </div>
      </div>
    </div>
  );
};

export default BoardContent;

