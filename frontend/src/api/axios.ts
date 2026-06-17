import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
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

        // Let the browser set the multipart boundary for FormData uploads.
        // A manually forced multipart content type without a boundary can
        // prevent Django from parsing uploaded files correctly.
        if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
            const headers = config.headers as Record<string, string> & { set?: (key: string, value: string | null) => void };
            if (typeof headers.set === 'function') {
                headers.set('Content-Type', null);
            } else {
                delete headers['Content-Type'];
                delete headers['content-type'];
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle errors (e.g. 401 token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // A stale/invalid token causes the server to reject authenticated
        // requests with 401. Clear it and send the user back to login instead
        // of failing silently while the UI still thinks it's authenticated.
        if (error.response?.status === 401 && localStorage.getItem('token')) {
            localStorage.removeItem('token');
            if (!window.location.pathname.startsWith('/login')) {
                window.location.assign('/login');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
