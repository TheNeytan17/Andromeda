import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'SLA';

class SLAService {
  getSLAs() {
    return axios.get(BASE_URL);
  }
  getSLAById(Id) {
    return axios.get(BASE_URL + '/' + Id);
  }
  seedSLAs() {
    return axios.post(BASE_URL + '/seed');
  }
}

export default new SLAService();
