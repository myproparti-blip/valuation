import { Message, Conversation, UserStatus } from "../models/chatModel.js";

// Get or create conversation
export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId, otherUserId, userRole, otherUserRole } = req.body;

    // Find existing conversation between these two users
    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { userId } },
          { $elemMatch: { userId: otherUserId } },
        ],
      },
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [
          { userId, role: userRole },
          { userId: otherUserId, role: otherUserRole },
        ],
        unreadCount: new Map([
          [userId, 0],
          [otherUserId, 0],
        ]),
      });
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      conversation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get conversations for a user
export const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      "participants.userId": userId,
      isActive: true,
    })
      .populate("participants")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, status: { $ne: "read" } },
      { status: "read", readAt: new Date() }
    );

    // Update conversation unread count
    await Conversation.updateOne(
      { _id: conversationId },
      { $set: { [`unreadCount.${userId}`]: 0 } }
    );

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user online status
export const getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const userStatus = await UserStatus.findOne({ userId });

    res.status(200).json({
      success: true,
      userStatus: userStatus || {
        userId,
        isOnline: false,
        lastSeen: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users for manager
export const getAvailableUsers = async (req, res) => {
  try {
    const { userRole } = req.params;
    let query = {};

    // Managers can chat with users and admins
    if (["manager1", "manager2"].includes(userRole)) {
      query.role = { $in: ["user", "admin"] };
    }
    // Users can chat with managers
    else if (userRole === "user") {
      query.role = { $in: ["manager1", "manager2"] };
    }
    // Admins can chat with managers
    else if (userRole === "admin") {
      query.role = { $in: ["manager1", "manager2"] };
    }

    const users = await UserStatus.find(query).select("userId role isOnline lastSeen");

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save message
export const saveMessage = async (req, res) => {
  try {
    const { conversationId, senderId, senderRole, content } = req.body;

    const message = new Message({
      conversationId,
      senderId,
      senderRole,
      content,
      status: "delivered",
      deliveredAt: new Date(),
    });

    await message.save();

    // Update conversation last message
    await Conversation.updateOne(
      { _id: conversationId },
      {
        lastMessage: {
          content,
          senderId,
          createdAt: new Date(),
        },
      }
    );

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
