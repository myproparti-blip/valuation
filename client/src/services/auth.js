import api from "./axios";

export const loginUser = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        "Login failed";
    throw new Error(errorMessage);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    // Error logged but logout should succeed even if server request fails
    return { message: "Logout completed" };
  }
};