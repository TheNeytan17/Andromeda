import i18n from '../i18n'
import { StrictMode, Suspense } from 'react'
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
import { CreateCategory } from './components/Maintenance/CreateCategory'
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
      { path: "TableCategory", element: <ListCategories /> }, // Lista Categorías
      { path: "Category/:id", element: <DetailCategory /> }, // Detalle Categoría
      { path: "CreateCategory/:id", element: <CreateCategory /> }, // Crear/Editar Categoría
      { path: "Ticket", element: <ListTickets /> }, // Lista Tickets
      { path: "Ticket/:id", element: <DetailTicket /> }, // Detalle Ticket
      { path: "Assignment", element: <TableAssignments /> }, // Lista Asignaciones
      { path: "Assignment/:id", element: <DetailAssignment /> }, // Detalle Asignación
    ]
  }
])

// Función para renderizar la app
function renderApp() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fc52af' }}>Cargando...</div>}>
        <RouterProvider router={rutas} />
      </Suspense>
    </StrictMode>,
  )
}

// Si i18next ya está inicializado, renderizar inmediatamente
if (i18n.isInitialized) {
  renderApp();
} else {
  // Si no, esperar al evento de inicialización
  i18n.on('initialized', () => {
    renderApp();
  });
}
