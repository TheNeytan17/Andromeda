import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'AutoTriage';

class AutoTriageService {
  getAutoTriage() {
    return axios.get(BASE_URL);
  }
}

export default new AutoTriageService();
