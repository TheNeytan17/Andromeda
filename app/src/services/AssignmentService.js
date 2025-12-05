import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Assignment';

class AssignmentService {
  getAssignments() {
    return axios.get(BASE_URL);
  }
  getAssignmentById(Id) {
    return axios.get(BASE_URL + '/' + Id);
  }
  // Obtener una sola asignación por Id de asignación
  getAssignmentSingle(Id) {
    return axios.get(BASE_URL + '/single/' + Id);
  }
  createAssignment(data) {
    return axios.post(BASE_URL, data);
  }
}

export default new AssignmentService();
