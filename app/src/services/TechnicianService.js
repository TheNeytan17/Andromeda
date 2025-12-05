import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Tech';

class TechnicianService {
  getTechnicians() {
    return axios.get(BASE_URL);
  }
  getTechnicianById(Id) {
    return axios.get(BASE_URL + '/' + Id);
  }
  getTechniciansByEtiqueta(Id) {
    return axios.get(BASE_URL + '/Etiqueta' + '/' + Id);
  }
  createTechnician(data) {
    return axios.post(BASE_URL, data);
  }
  updateTechnician(Id, data) {
    return axios.put(BASE_URL + '/' + Id, data);
  }
}

export default new TechnicianService();
