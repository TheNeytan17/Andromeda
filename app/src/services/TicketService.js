import axios from 'axios';
import UserService from './UserService';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Ticket';

class TicketService {
  getTickets() {
    return axios.get(BASE_URL);
  }
  getTicketById(Id) {
    return axios.get(BASE_URL + '/' + Id);
  }
  getTicketTechnician(Id) {
    return axios.get(BASE_URL + '/technician/' + Id);
  }
  getTicketClient(Id) {
    return axios.get(BASE_URL + '/client/' + Id);
  }
}

export default new TicketService();
