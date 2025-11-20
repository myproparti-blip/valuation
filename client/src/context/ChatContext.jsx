import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const connectionAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      auth: {
        userId: user.username,
        role: user.role,
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      connectionAttempts.current = 0;
      newSocket.emit("user_connected", {
        userId: user.username,
        role: user.role,
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("user_online", (data) => {
      setOnlineUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        return [...filtered, { userId: data.userId, isOnline: true }];
      });
    });

    newSocket.on("user_offline", (data) => {
      setOnlineUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId ? { ...u, isOnline: false } : u
        )
      );
    });

    newSocket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === data.conversationId
            ? {
                ...conv,
                lastMessage: {
                  content: data.content,
                  senderId: data.senderId,
                  createdAt: data.createdAt,
                },
              }
            : conv
        )
      );
    });

    newSocket.on("user_typing", (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.conversationId]: data.userId,
      }));
    });

    newSocket.on("user_stop_typing", (data) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[data.conversationId];
        return updated;
      });
    });

    newSocket.on("messages_read", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === data.conversationId &&
          msg.senderId === user.username &&
          msg.status !== "read"
            ? { ...msg, status: "read", readAt: data.readAt }
            : msg
        )
      );
    });

    newSocket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = (conversationId, recipientId, content) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!socket || !user) return;

    socket.emit("send_message", {
      conversationId,
      senderId: user.username,
      senderRole: user.role,
      recipientId,
      content,
    });
  };

  const markAsRead = (conversationId, senderId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!socket || !user) return;

    // Mark messages in database
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/chat/messages/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        userId: user.username,
      }),
    }).catch(err => console.error("Error marking read:", err));

    // Emit read receipt via socket
    socket.emit("message_read", {
      conversationId,
      senderId,
      recipientId: user.username,
    });
  };

  const emitTyping = (conversationId, recipientId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!socket || !user) return;

    socket.emit("typing", {
      conversationId,
      userId: user.username,
      userRole: user.role,
      recipientId,
    });
  };

  const emitStopTyping = (conversationId) => {
    if (!socket) return;
    socket.emit("stop_typing", { conversationId });
  };

  const getOnlineStatus = (userId) => {
    const user = onlineUsers.find((u) => u.userId === userId);
    return user?.isOnline || false;
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        conversations,
        setConversations,
        activeConversation,
        setActiveConversation,
        messages,
        setMessages,
        onlineUsers,
        typingUsers,
        unreadCount,
        setUnreadCount,
        sendMessage,
        markAsRead,
        emitTyping,
        emitStopTyping,
        getOnlineStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
