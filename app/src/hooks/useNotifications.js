import { useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import NotificationService from '../../services/NotificationService';

/**
 * Hook personalizado para manejar notificaciones en tiempo real
 * Hace polling cada intervalo especificado y muestra toasts para nuevas notificaciones
 * 
 * NOTA: Este hook NO está siendo utilizado actualmente en la aplicación.
 * La funcionalidad de notificaciones está implementada directamente en NotificationPanel.jsx
 * Se mantiene como referencia para futuras implementaciones.
 */
export const useNotifications = (intervalMs = 30000) => {
  const checkForNewNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await NotificationService.getUnreadCount();
      const count = response.data.count || 0;

      // Guardar el último contador para comparar
      const lastCount = parseInt(localStorage.getItem('lastNotificationCount') || '0');
      
      if (count > lastCount) {
        // Hay nuevas notificaciones
        const newCount = count - lastCount;
        
        // Obtener las notificaciones no leídas
        const notificationsResponse = await NotificationService.getUnreadNotifications();
        const notifications = notificationsResponse.data || [];
        
        // Mostrar solo las más recientes
        const recentNotifications = notifications.slice(0, Math.min(newCount, 3));
        
        recentNotifications.forEach((notification) => {
          const icon = getNotificationIcon(notification.Tipo_Notificacion);
          toast(`${icon} ${notification.Mensaje}`, {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#3b82f6',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
            },
          });
        });
      }
      
      // Actualizar el contador guardado
      localStorage.setItem('lastNotificationCount', count.toString());
    } catch (error) {
      console.error('Error al verificar nuevas notificaciones:', error);
    }
  }, []);

  useEffect(() => {
    // Inicializar contador al montar
    const initializeCount = async () => {
      try {
        const response = await NotificationService.getUnreadCount();
        const count = response.data.count || 0;
        localStorage.setItem('lastNotificationCount', count.toString());
      } catch (error) {
        console.error('Error al inicializar contador:', error);
      }
    };

    initializeCount();

    // Configurar polling
    const interval = setInterval(checkForNewNotifications, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [checkForNewNotifications, intervalMs]);

  return { checkForNewNotifications };
};

const getNotificationIcon = (tipo) => {
  switch (tipo) {
    case 1:
    case 'Asignación de ticket':
      return '📋';
    case 2:
    case 'Cambio de estado':
      return '🔄';
    case 3:
    case 'Nueva observación':
      return '💬';
    case 4:
    case 'Inicio de sesión':
      return '🔐';
    default:
      return '🔔';
  }
};

export default useNotifications;
