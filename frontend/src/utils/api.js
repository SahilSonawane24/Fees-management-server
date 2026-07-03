import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://server-fms-1phq.onrender.com/api',
});

// Add a request interceptor to add the auth token to every request
API.interceptors.request.use((config) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
});

export default API;
