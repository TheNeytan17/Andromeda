import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL;

/**
 * Servicio para gestión de valoraciones
 */
const ValoracionService = {
    /**
     * Crear nueva valoración para un ticket
     * @param {Object} valoracionData - {Id_Ticket, Id_Usuario, Puntaje, Comentario}
     * @returns {Promise}
     */
    createValoracion: async (valoracionData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/valoracion`, valoracionData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error('Error al crear valoración:', error);
            throw error;
        }
    },

    /**
     * Obtener valoración de un ticket específico
     * @param {number} idTicket - ID del ticket
     * @returns {Promise}
     */
    getValoracionByTicket: async (idTicket) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/valoracion/${idTicket}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Error al obtener valoración:', error);
            throw error;
        }
    },

    /**
     * Verificar si un ticket ya tiene valoración
     * @param {number} idTicket - ID del ticket
     * @returns {Promise}
     */
    checkValoracionExists: async (idTicket) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/valoracion/exists/${idTicket}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Error al verificar valoración:', error);
            throw error;
        }
    },

    /**
     * Obtener todas las valoraciones con filtros opcionales
     * @param {Object} filters - {tecnico, fecha_inicio, fecha_fin}
     * @returns {Promise}
     */
    getAllValoraciones: async (filters = {}) => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const url = queryParams ? `${API_URL}/valoracion?${queryParams}` : `${API_URL}/valoracion`;
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Error al obtener valoraciones:', error);
            throw error;
        }
    },

    /**
     * Obtener promedio de valoraciones de un técnico
     * @param {number} idTecnico - ID del técnico
     * @returns {Promise}
     */
    getAverageByTechnician: async (idTecnico) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/valoracion/average/${idTecnico}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Error al obtener promedio:', error);
            throw error;
        }
    }
};

export default ValoracionService;
