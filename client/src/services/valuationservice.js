import api from "./axios";

const API_BASE_URL = "/valuations";

const handleError = (error, defaultMessage) => {
  const errorMessage = error?.response?.data?.message || 
                      error?.message || 
                      defaultMessage;
  throw new Error(errorMessage);
};

// Create a new valuation
export const createValuation = async (data) => {
  try {
    const response = await api.post(`${API_BASE_URL}`, data);
    return response.data.data || response.data;
  } catch (error) {
    handleError(error, "Failed to create valuation");
  }
};

// Get valuation by ID
export const getValuationById = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error("Forbidden - You can only view your own records");
    }
    if (error.response?.status === 404) {
      throw new Error("Valuation form not found");
    }
    handleError(error, "Failed to fetch valuation");
  }
};

// Update valuation
export const updateValuation = async (id, data) => {
  try {
    const response = await api.put(`${API_BASE_URL}/${id}`, data);
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
    handleError(error, "Failed to update valuation");
  }
};

// Manager submit (approve/reject)
export const managerSubmit = async (id, data) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${id}/manager-submit`, data);
    return response.data.data || response.data;
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
    handleError(error, "Failed to submit manager action");
  }
};

// Get all valuations (for admin/manager dashboard)
export const getAllValuations = async (params) => {
  try {
    const response = await api.get(`${API_BASE_URL}`, { params });
    // API returns array directly, not wrapped in {data: [...]}
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    handleError(error, "Failed to fetch valuations");
    return [];
  }
};

// Delete valuation
export const deleteValuation = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to delete valuation");
  }
};

// Request rework (Manager/Admin only)
export const requestRework = async (id, reworkComments) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${id}/request-rework`, {
      reworkComments
    });
    return response.data.data || response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error("Forbidden - Only manager or admin can request rework");
    }
    if (error.response?.status === 404) {
      throw new Error("Valuation form not found");
    }
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Cannot request rework for this status");
    }
    handleError(error, "Failed to request rework");
  }
};
