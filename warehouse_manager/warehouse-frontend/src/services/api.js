import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

// Configurar el token de autenticación para cada solicitud
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const getExits = () => axios.get(`${API_URL}exits/`);
export const getArticles = () => axios.get(`${API_URL}articles/`);
export const getClients = () => axios.get(`${API_URL}clients/`);
export const getEntries = () => axios.get(`${API_URL}entries/`);

export const createEntry = (entryData) => axios.post(`${API_URL}entries/`, entryData);
export const createMultipleExits = (exitData) => axios.post(`${API_URL}exits/create_multiple/`, exitData);
