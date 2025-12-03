import api from "./axios";

// Use the shared axios instance which has authentication interceptor

// Create a new bill
export const createBill = async (billData) => {
  const response = await api.post("/bills", billData);
  return response.data;
};

// Get all bills
export const getAllBills = async () => {
  const response = await api.get("/bills");
  return response.data;
};

// Get bill by ID
export const getBillById = async (billNumber) => {
  const response = await api.get(`/bills/${billNumber}`);
  return response.data;
};

// Update bill
export const updateBill = async (billNumber, billData) => {
  const response = await api.put(`/bills/${billNumber}`, billData);
  return response.data;
};

// Approve bill
export const approveBill = async (billNumber) => {
  const response = await api.post(`/bills/${billNumber}/approve`, {});
  return response.data;
};

// Reject bill
export const rejectBill = async (billNumber, reason) => {
  const response = await api.post(`/bills/${billNumber}/reject`, { reason });
  return response.data;
};

// Delete bill
export const deleteBill = async (billNumber) => {
  const response = await api.delete(`/bills/${billNumber}`);
  return response.data;
};

export default api;
