import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'IA';

class IAService {
  getResponse(message, conversationHistory = []) {
    return axios.post(BASE_URL + '/CallIA', { 
      message,
      conversation_history: conversationHistory 
    });
  }
}

export default new IAService();
