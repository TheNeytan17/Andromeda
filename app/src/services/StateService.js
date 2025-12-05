import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'State';

class StateService {
  getStates() {
    return axios.get(BASE_URL);
  }
}

export default new StateService();