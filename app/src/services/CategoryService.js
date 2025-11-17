import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Category';

class CategoryService {
  getCategories() {
    return axios.get(BASE_URL);
  }
  getCategoryById(Id) {
    return axios.get(BASE_URL + '/' + Id);
  }
  createCategory(data) {
    return axios.post(BASE_URL, data);
  }
  updateCategory(Id, data) {
    return axios.put(BASE_URL + '/' + Id, data);
  }
}

export default new CategoryService();
