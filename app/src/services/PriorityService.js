import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Priority';

class PriorityService {
  getPrioridades() {
    return axios.get(BASE_URL);
  }
}

export default new PriorityService();
