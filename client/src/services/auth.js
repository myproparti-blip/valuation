import api from "./axios";

const API_BASE_URL = "/auth";

const handleError = (error, defaultMessage) => {
  const errorMessage = error?.response?.data?.message || 
                      error?.message || 
                      defaultMessage;
  throw new Error(errorMessage);
};

export const loginUser = async (username, password) => {
  try {
    const response = await api.post(`${API_BASE_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    handleError(error, "Login failed");
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post(`${API_BASE_URL}/logout`);
    return response.data;
  } catch (error) {
    // Error logged but logout should succeed even if server request fails
    return { message: "Logout completed" };
  }
};