import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Add auth info to requests
api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      // Pass full user object in Authorization header for server-side auth
      config.headers["Authorization"] = encodeURIComponent(JSON.stringify(userData));
      
      // Handle FormData - don't set Content-Type header
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
    } catch (e) {
      // Invalid JSON, skip
    }
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;