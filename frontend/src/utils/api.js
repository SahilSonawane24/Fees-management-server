import axios from 'axios';

// Resolve base URL and ensure it ends with `/api`.
const rawBase =  (typeof window !== 'undefined' && window.location && !/localhost|127\.0\.0\.1/.test(window.location.hostname)
    ? window.location.origin:'https://server-fms-1phq.onrender.com'
    );

const trimmed = rawBase.replace(/\/+$|\s+/g, '');
const resolvedBaseURL = /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;

const API = axios.create({
    baseURL: resolvedBaseURL,
});

// Add a request interceptor to add the auth token to every request
API.interceptors.request.use((config) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
});

// Add a response interceptor to log failures for easier debugging
API.interceptors.response.use(
    (response) => response,
    (error) => {
        try {
            const url = error.config && error.config.url ? error.config.url : 'unknown url';
            const method = error.config && error.config.method ? error.config.method : 'unknown method';
            const status = error.response && error.response.status ? error.response.status : 'no status';
            console.error(`API Error: ${method.toUpperCase()} ${url} -> ${status}`, error.response && error.response.data ? error.response.data : error.message);
        } catch (e) {
            console.error('API Error logging failed', e);
        }
        return Promise.reject(error);
    }
);

export default API;
