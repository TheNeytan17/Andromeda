import axios from 'axios';
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
  createTicket(data) {
    return axios.post(BASE_URL, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  updateTicket(Id, data) {
    return axios.put(BASE_URL + '/' + Id, data);
  }
}

export default new TicketService();
