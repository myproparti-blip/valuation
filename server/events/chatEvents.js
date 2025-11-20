import { Message, UserStatus } from "../models/chatModel.js";

// Store active users and their socket connections
const activeUsers = new Map();

export const setupChatEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // User connects / logs in
    socket.on("user_connected", async (data) => {
      const { userId, role } = data;

      // Store user connection
      activeUsers.set(userId, { socketId: socket.id, role });
      socket.userId = userId;
      socket.userRole = role;
      socket.join(`user_${userId}`);

      // Update user status in DB
      await UserStatus.findOneAndUpdate(
        { userId },
        {
          userId,
          role,
          isOnline: true,
          lastSeen: new Date(),
          socketId: socket.id,
        },
        { upsert: true }
      );

      // Notify all connected clients about user online
      io.emit("user_online", { userId, role, isOnline: true });

      console.log(`User ${userId} connected with role ${role}`);
    });

    // Send message
    socket.on("send_message", async (data) => {
      const { conversationId, senderId, senderRole, recipientId, content } = data;

      try {
        // Create message
        const message = new Message({
          conversationId,
          senderId,
          senderRole,
          content,
          status: "delivered",
          deliveredAt: new Date(),
        });

        await message.save();

        // Emit message to both users
        io.to(`user_${senderId}`).emit("receive_message", {
          messageId: message._id,
          conversationId,
          senderId,
          senderRole,
          content,
          status: "delivered",
          createdAt: message.createdAt,
        });

        io.to(`user_${recipientId}`).emit("receive_message", {
          messageId: message._id,
          conversationId,
          senderId,
          senderRole,
          content,
          status: "delivered",
          createdAt: message.createdAt,
        });

        // Update unread count for recipient if offline
        const recipient = activeUsers.get(recipientId);
        if (!recipient) {
          // User is offline - message will be marked as unread
        }
      } catch (error) {
        socket.emit("message_error", { error: error.message });
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      const { conversationId, userId, userRole, recipientId } = data;
      io.to(`user_${recipientId}`).emit("user_typing", {
        conversationId,
        userId,
        userRole,
      });
    });

    // Stop typing
    socket.on("stop_typing", (data) => {
      const { conversationId, recipientId } = data;
      io.to(`user_${recipientId}`).emit("user_stop_typing", {
        conversationId,
      });
    });

    // Message read receipt
    socket.on("message_read", async (data) => {
      const { conversationId, senderId, recipientId } = data;

      try {
        // Get all unread messages from sender in this conversation
        const messages = await Message.find({
          conversationId,
          senderId: { $ne: recipientId }, // Messages NOT from current user (from sender)
          status: { $ne: "read" },
        });

        // Update message status
        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: recipientId },
            status: { $ne: "read" },
          },
          {
            status: "read",
            readAt: new Date(),
          }
        );

        // Notify each sender that their messages are read
        const senderIds = [...new Set(messages.map(msg => msg.senderId))];
        senderIds.forEach(msgSenderId => {
          io.to(`user_${msgSenderId}`).emit("messages_read", {
            conversationId,
            readBy: recipientId,
            readAt: new Date(),
          });
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // User disconnects
    socket.on("disconnect", async () => {
      const userId = socket.userId;

      if (userId) {
        // Update user status in DB
        await UserStatus.findOneAndUpdate(
          { userId },
          {
            isOnline: false,
            lastSeen: new Date(),
          }
        );

        // Remove from active users
        activeUsers.delete(userId);

        // Notify all clients about user offline
        io.emit("user_offline", { userId, isOnline: false });

        console.log(`User ${userId} disconnected`);
      }
    });

    // Get online users
    socket.on("get_online_users", () => {
      const onlineUsers = Array.from(activeUsers.entries()).map(
        ([userId, data]) => ({
          userId,
          role: data.role,
          isOnline: true,
        })
      );
      socket.emit("online_users", onlineUsers);
    });

    // Error handler
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};

// Get active user count
export const getActiveUserCount = () => {
  return activeUsers.size;
};

// Get active users
export const getActiveUsers = () => {
  return Array.from(activeUsers.entries()).map(([userId, data]) => ({
    userId,
    role: data.role,
    socketId: data.socketId,
  }));
};
