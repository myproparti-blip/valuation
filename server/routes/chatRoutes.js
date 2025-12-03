import express from "express";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  markAsRead,
  getUserStatus,
  getAvailableUsers,
  saveMessage,
} from "../controllers/chatController.js";

const router = express.Router();

// Conversation routes
router.post("/conversation/create", getOrCreateConversation);
router.get("/conversations/:userId", getConversations);

// Message routes
router.get("/messages/:conversationId", getMessages);
router.post("/messages/mark-read", markAsRead);
router.post("/messages/save", saveMessage);

// User status routes
router.get("/user-status/:userId", getUserStatus);
router.get("/available-users/:userRole", getAvailableUsers);

export default router;
