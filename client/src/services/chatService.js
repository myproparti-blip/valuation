import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const chatAPI = axios.create({
  baseURL: `${API_URL}/chat`,
});

// Get or create conversation
export const getOrCreateConversation = async (
  userId,
  otherUserId,
  userRole,
  otherUserRole
) => {
  try {
    const response = await chatAPI.post("/conversation/create", {
      userId,
      otherUserId,
      userRole,
      otherUserRole,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Get all conversations for a user
export const getConversations = async (userId) => {
  try {
    const response = await chatAPI.get(`/conversations/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId, limit = 50, offset = 0) => {
  try {
    const response = await chatAPI.get(`/messages/${conversationId}`, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Mark messages as read
export const markAsRead = async (conversationId, userId) => {
  try {
    const response = await chatAPI.post("/messages/mark-read", {
      conversationId,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Get user online status
export const getUserStatus = async (userId) => {
  try {
    const response = await chatAPI.get(`/user-status/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user status:", error);
    throw error;
  }
};

// Get available users for chat
export const getAvailableUsers = async (userRole) => {
  try {
    const response = await chatAPI.get(`/available-users/${userRole}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching available users:", error);
    throw error;
  }
};

// Save message (backup)
export const saveMessage = async (conversationId, senderId, senderRole, content) => {
  try {
    const response = await chatAPI.post("/messages/save", {
      conversationId,
      senderId,
      senderRole,
      content,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};
