import api from "./axios";

const API_BASE_URL = "/chat";

const handleError = (error, defaultMessage) => {
  const errorMessage = error?.response?.data?.message || 
                      error?.message || 
                      defaultMessage;
  throw new Error(errorMessage);
};

// Get or create conversation
export const getOrCreateConversation = async (
  userId,
  otherUserId,
  userRole,
  otherUserRole
) => {
  try {
    const response = await api.post(`${API_BASE_URL}/conversation/create`, {
      userId,
      otherUserId,
      userRole,
      otherUserRole,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Error creating conversation");
  }
};

// Get all conversations for a user
export const getConversations = async (userId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/conversations/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching conversations");
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId, limit = 50, offset = 0) => {
  try {
    const response = await api.get(`${API_BASE_URL}/messages/${conversationId}`, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching messages");
  }
};

// Mark messages as read
export const markAsRead = async (conversationId, userId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/messages/mark-read`, {
      conversationId,
      userId,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Error marking messages as read");
  }
};

// Get user online status
export const getUserStatus = async (userId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/user-status/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching user status");
  }
};

// Get available users for chat
export const getAvailableUsers = async (userRole) => {
  try {
    const response = await api.get(`${API_BASE_URL}/available-users/${userRole}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching available users");
  }
};

// Save message (backup)
export const saveMessage = async (conversationId, senderId, senderRole, content) => {
  try {
    const response = await api.post(`${API_BASE_URL}/messages/save`, {
      conversationId,
      senderId,
      senderRole,
      content,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Error saving message");
  }
};
