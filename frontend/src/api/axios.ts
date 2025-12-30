import axios from 'axios';

// Create generic axios instance
const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Update in production
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle errors (e.g. 401 token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token invalid/expired
            // Optionally clear storage and redirect
            localStorage.removeItem('token');
            // window.location.href = '/login'; // Or handle via context
        }
        return Promise.reject(error);
    }
);

export default api;
