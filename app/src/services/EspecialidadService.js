import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Especialidad';

class EspecialidadService {
  getEspecialidades() {
    return axios.get(BASE_URL);
  }
  getEspecialidadById(Id) {
    return axios.get(BASE_URL + '/' + Id);
  }
}

export default new EspecialidadService();
