import axios from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  maxBodyLength: Infinity,
  headers: { 
    'Content-Type': 'application/json',
  },
});

// ✅ PUBLIC ROUTES - JINHE TOKEN KI ZAROORAT NAHI HAI
const PUBLIC_ROUTES = [
  '/Authentication/register',
  '/Authentication/login',
  '/User/check-user'
];

// Request interceptor to add token (EXCEPT public routes)
apiClient.interceptors.request.use((config) => {
  // ✅ Check if this is a public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));
  
  if (!isPublicRoute) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// Response interceptor to handle 401 (EXCEPT public routes)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicRoute = error.config?.url && PUBLIC_ROUTES.some(route => error.config.url.includes(route));
    
    if (error.response?.status === 401 && !isPublicRoute) {
      toast.error("Session expired! Please login again.");
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("regno");
      localStorage.removeItem("userData");
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
    return Promise.reject(error);
  }
);

export default apiClient;