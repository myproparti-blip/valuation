// valuationservice.js or filreservice.js
import api from "./axios";

const handleError = (error, defaultMessage) => {
  let errorMessage = defaultMessage;
  
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  throw new Error(errorMessage);
};

// For user form submissions
export const submitFile = async (fileData) => {
  try {
    const response = await api.post("/files", fileData);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to submit file");
  }
};

export const getFiles = async (username, role) => {
  try {
    const response = await api.get("/files", {
      params: { username, role }
    });
    return response.data;
  } catch (error) {
    handleError(error, "Failed to fetch files");
  }
};

// For manager/admin status updates - use PATCH
export const updateFileStatus = async (fileId, statusData) => {
  try {
    const response = await api.patch(`/files/${fileId}/status`, statusData);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to update file status");
  }
};

// Alias for managerSubmit to match frontend usage
export const managerSubmit = async (fileId, statusData) => {
  return updateFileStatus(fileId, statusData);
};

// Alternative method using POST (if PATCH doesn't work)
export const managerSubmitFile = async (fileId, statusData) => {
  try {
    const response = await api.post(`/files/${fileId}/status`, statusData);
    return response.data;
  } catch (error) {
    handleError(error, "Failed to submit manager action");
  }
};