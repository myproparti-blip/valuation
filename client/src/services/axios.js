import axios from "axios";

// Simple in-memory cache for GET requests
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Store notification function to be set after app initializes
let notificationHandler = null;
let unauthorizedErrorShown = false;

export const setNotificationHandler = (handler) => {
  notificationHandler = handler;
};

export const resetUnauthorizedErrorFlag = () => {
  unauthorizedErrorShown = false;
};

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
  } else {
    // For unauthenticated users, send a default guest user
    // This allows read-only access to the dashboard
    if (config.method === 'get') {
      const guestUser = { username: "guest", role: "guest" };
      config.headers["Authorization"] = encodeURIComponent(JSON.stringify(guestUser));
    }
  }

  // Add cache logic for GET requests
  if (config.method === 'get') {
    const cacheKey = `${config.url}?${new URLSearchParams(config.params).toString()}`;
    const cached = requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Return cached data without making request
      return Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK (Cached)',
        headers: {},
        config: config,
        cached: true
      });
    }
  }

  return config;
});

// Add response interceptor with caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200 && !response.cached) {
      const cacheKey = `${response.config.url}?${new URLSearchParams(response.config.params).toString()}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    // Check for "Unauthorized - Missing user information" error
    if (error?.response?.status === 401 && 
        error?.response?.data?.message === "Unauthorized - Missing user information") {
      // Show persistent unauthorized error notification only once
      if (!unauthorizedErrorShown && notificationHandler) {
        unauthorizedErrorShown = true;
        notificationHandler.showUnauthorizedError("Unauthorized – Please login to continue.");
      }
    }
    return Promise.reject(error);
  }
);

// Export cache clear function for manual cleanup
export const clearCache = () => {
  requestCache.clear();
};

// Export cache invalidation function for specific endpoints
export const invalidateCache = (pattern) => {
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key);
    }
  }
};

export default api;