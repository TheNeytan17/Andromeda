import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'notification';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

class NotificationService {
  /**
   * Obtener todas las notificaciones del usuario autenticado
   */
  getAllNotifications() {
    return axios.get(BASE_URL, getAuthHeaders());
  }

  /**
   * Obtener notificaciones no leídas
   */
  getUnreadNotifications() {
    return axios.get(`${BASE_URL}/unread`, getAuthHeaders());
  }

  /**
   * Obtener el contador de notificaciones no leídas
   */
  getUnreadCount() {
    return axios.get(`${BASE_URL}/count`, getAuthHeaders());
  }

  /**
   * Obtener una notificación específica por ID
   */
  getNotificationById(id) {
    return axios.get(`${BASE_URL}/${id}`, getAuthHeaders());
  }

  /**
   * Marcar una notificación como leída
   */
  markAsRead(id) {
    return axios.put(`${BASE_URL}/read/${id}`, {}, getAuthHeaders());
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead() {
    return axios.put(`${BASE_URL}/readall`, {}, getAuthHeaders());
  }

  /**
   * Eliminar una notificación
   */
  deleteNotification(id) {
    return axios.delete(`${BASE_URL}/${id}`, getAuthHeaders());
  }

  /**
   * Crear una notificación (admin/testing)
   */
  createNotification(data) {
    return axios.post(BASE_URL, data, getAuthHeaders());
  }
}

export default new NotificationService();
