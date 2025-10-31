import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router'
import { Layout } from './components/Layout/Layout'
import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'

//Componentes Mantenimiento
import ListTechnician from './components/Maintenance/TableTechnician'
import { DetailTechnician } from './components/Maintenance/DetailTechnician'
import ListCategories from './components/Maintenance/TableCategory'
import { DetailCategory } from './components/Maintenance/DetailCategory'
import ListTickets from './components/Maintenance/TableTicket'
import { DetailTicket } from './components/Maintenance/DetailTicket'
import TableAssignments from './components/Maintenance/TableAssign'
import { DetailAssignment } from './components/Maintenance/DetailAssign'

const rutas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Ruta principal
      { index: true, element: <Home /> },
      // Ruta comodín (404)
      { path: "*", element: <PageNotFound /> },
      //Rutas componentes
      { path: "Technician", element: <ListTechnician /> },// Lista Tecnicos
      { path: "Technician/:id", element: <DetailTechnician /> }, // Detalle Tecnico
      { path: "Category", element: <ListCategories /> }, // Lista Categorías
      { path: "Category/:id", element: <DetailCategory /> }, // Detalle Categoría
      { path: "Ticket", element: <ListTickets /> }, // Lista Tickets
      { path: "Ticket/:id", element: <DetailTicket /> }, // Detalle Ticket
      { path: "Assignment", element: <TableAssignments /> }, // Lista Asignaciones
      { path: "Assignment/:id", element: <DetailAssignment /> }, // Detalle Asignación
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
)
