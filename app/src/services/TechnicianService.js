import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Tech';

class TechnicianService {
  getTechnicians() {
    return axios.get(BASE_URL);
  }
  getTechnicianById(Id) {
    return axios.get(BASE_URL + '/' + Id);
  }
}

export default new TechnicianService();
