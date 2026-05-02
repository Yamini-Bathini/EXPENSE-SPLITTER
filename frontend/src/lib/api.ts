import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('expense-splitter-user');
  console.log('API interceptor: raw localStorage:', raw);
  if (raw) {
    try {
      const user = JSON.parse(raw);
      console.log('API interceptor: parsed user:', user);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
        console.log('API interceptor: added Authorization header');
      } else {
        console.log('API interceptor: no token in user object');
      }
    } catch (e) {
      console.log('API interceptor: error parsing user:', e);
    }
  } else {
    console.log('API interceptor: no user in localStorage');
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      console.log('API interceptor: 401 Unauthorized detected on protected route, clearing session');
      localStorage.removeItem('expense-splitter-user');
      globalThis.location.href = '/login';
    }
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
