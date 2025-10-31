import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Category';

class CategoryService {
  getCategories() {
    return axios.get(BASE_URL);
  }
  getCategoryById(Id) {
    return axios.get(BASE_URL + '/' + Id);
  }
}

export default new CategoryService();
