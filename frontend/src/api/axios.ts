import axios from 'axios';

// Create generic axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // Send cookies (incl. Django's `sessionid` and `csrftoken`) cross-origin so
    // the backend can validate CSRF on unsafe methods.
    withCredentials: true,
    // Axios automatically reads this cookie and attaches the value as the
    // header below on every mutating request — matches Django's defaults.
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

/**
 * One-shot priming call: hits the backend's `/auth/csrf/` endpoint so Django
 * sets the `csrftoken` cookie that axios will then echo back on POST/PUT/
 * PATCH/DELETE requests. Safe to call multiple times; we de-duplicate via a
 * module-level promise.
 */
let _csrfPromise: Promise<void> | null = null;
export const ensureCsrf = (): Promise<void> => {
    if (!_csrfPromise) {
        _csrfPromise = api.get('/auth/csrf/').then(() => undefined).catch(() => {
            _csrfPromise = null; // allow retry on next call
        });
    }
    return _csrfPromise;
};

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
