import axiosInstance from "./axios";

const API_BASE_URL = "/valuations";

// Create a new valuation
export const createValuation = async (data) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}`, data);
    return response.data.data || response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to create valuation";
    throw new Error(errorMsg);
  }
};

// Get valuation by ID
export const getValuationById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error("Forbidden - You can only view your own records");
    }
    if (error.response?.status === 404) {
      throw new Error("Valuation form not found");
    }
    const errorMsg = error.response?.data?.message || error.message || "Failed to fetch valuation";
    throw new Error(errorMsg);
  }
};

// Update valuation
export const updateValuation = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, data);
    return response.data.data || response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error("Forbidden - You can only update your own pending submissions");
    }
    if (error.response?.status === 404) {
      throw new Error("Valuation form not found");
    }
    if (error.response?.status === 400) {
      // Handle validation errors from server
      const validationErrors = error.response?.data?.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        throw new Error("Validation failed:\n\n" + validationErrors.join("\n"));
      }
      throw new Error(error.response?.data?.message || "Validation failed");
    }
    const errorMsg = error.response?.data?.message || error.message || "Failed to update valuation";
    throw new Error(errorMsg);
  }
};

// Manager submit (approve/reject)
export const managerSubmit = async (id, data) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/${id}/manager-submit`, data);
    
    const result = response.data.data || response.data;
    
    return result;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error("Forbidden - Only manager or admin can approve/reject");
    }
    if (error.response?.status === 404) {
      throw new Error("Valuation form not found");
    }
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid request");
    }
    const errorMsg = error.response?.data?.message || error.message || "Failed to submit manager action";
    throw new Error(errorMsg);
  }
};

// Get all valuations (for admin/manager dashboard)
export const getAllValuations = async (params) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`, { params });
    return response.data || [];
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to fetch valuations";
    throw new Error(errorMsg);
  }
};

// Delete valuation
export const deleteValuation = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to delete valuation";
    throw new Error(errorMsg);
  }
};
