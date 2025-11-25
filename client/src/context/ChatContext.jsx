import React, { createContext, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Chat functionality disabled - using REST API only
  const value = {
    socket: null,
    conversations: [],
    setConversations: () => {},
    activeConversation: null,
    setActiveConversation: () => {},
    messages: [],
    setMessages: () => {},
    onlineUsers: [],
    typingUsers: {},
    unreadCount: 0,
    setUnreadCount: () => {},
    sendMessage: () => {},
    markAsRead: () => {},
    emitTyping: () => {},
    emitStopTyping: () => {},
    getOnlineStatus: () => false,
  };

  return (
    <ChatContext.Provider value={value}>
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
