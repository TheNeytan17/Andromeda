import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'user';

class UserService {
  /**
   * Obtener todos los usuarios
   */
  getUsers() {
    return axios.get(BASE_URL);
  }

  /**
   * Obtener usuario por ID
   */
  getUserById(UserId) {
    return axios.get(BASE_URL + '/' + UserId);
  }

  /**
   * Crear nuevo usuario
   */
  createUser(userData) {
    return axios.post(BASE_URL, userData);
  }

  /**
   * Actualizar usuario existente
   */
  updateUser(UserId, userData) {
    return axios.put(BASE_URL + '/' + UserId, userData);
  }

  /**
   * Restablecer contraseña de usuario
   */
  resetPassword(UserId, newPassword) {
    return axios.put(BASE_URL + '/' + UserId, {
      Password: newPassword
    });
  }

  /**
   * Eliminar usuario
   */
  deleteUser(UserId) {
    return axios.delete(BASE_URL + '/' + UserId);
  }
}

export default new UserService();
