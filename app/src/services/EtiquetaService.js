import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Etiqueta';

class EtiquetaService {
  getEtiquetas() {
    return axios.get(BASE_URL);
  }
  getEtiquetaById(Id) {
    return axios.get(BASE_URL + '/' + Id);
  }
}

export default new EtiquetaService();
