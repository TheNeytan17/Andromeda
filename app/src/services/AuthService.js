import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'auth';

class AuthService {
  /**
   * Iniciar sesión
   */
  login(correo, password) {
    return axios.post(`${BASE_URL}/login`, {
      Correo: correo,
      Password: password,
    });
  }

  /**
   * Registrar nuevo usuario
   */
  register(nombre, correo, password, rol = 3) {
    return axios.post(`${BASE_URL}/register`, {
      Nombre: nombre,
      Correo: correo,
      Password: password,
      Rol: rol,
    });
  }

  /**
   * Verificar token
   */
  verify() {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Cerrar sesión
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return axios.post(`${BASE_URL}/logout`);
  }

  /**
   * Guardar token y usuario en localStorage
   */
  saveAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  /**
   * Obtener token
   */
  getToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();
