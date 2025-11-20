import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPaperPlane, FaCircle, FaSpinner } from "react-icons/fa";
import { useChat } from "../../context/ChatContext";
import { getConversations, getMessages, getOrCreateConversation, getAvailableUsers } from "../../services/chatService";
import "./ChatModal.css";

const ChatModal = ({ isOpen, onClose, user }) => {
  const {
    socket,
    messages,
    setMessages,
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    sendMessage,
    markAsRead,
    emitTyping,
    emitStopTyping,
    getOnlineStatus,
    typingUsers,
  } = useChat();

  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showAvailableUsers, setShowAvailableUsers] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch existing conversations
        const conversationsData = await getConversations(user.username);
        setConversations(conversationsData.conversations || []);
        
        // Fetch available users to chat with
        const usersData = await getAvailableUsers(user.role);
        setAvailableUsers(usersData.users || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, user, setConversations]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const data = await getMessages(activeConversation._id);
        setMessages(data.messages || []);

        // Mark messages as read - from selected user
        markAsRead(activeConversation._id, selectedUser.userId);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [activeConversation, selectedUser, setMessages, user, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeConversation && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, activeConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation || !selectedUser) return;

    sendMessage(
      activeConversation._id,
      selectedUser.userId,
      messageInput.trim()
    );

    setMessageInput("");
    emitStopTyping(activeConversation._id);
    setIsTyping(false);
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      emitTyping(activeConversation._id, selectedUser.userId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(activeConversation._id);
      setIsTyping(false);
    }, 3000);
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find((p) => p.userId !== user.username);
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    const otherParticipant = getOtherParticipant(conversation);
    setSelectedUser(otherParticipant);
    setShowAvailableUsers(false);
  };

  const handleStartNewConversation = async (availableUser) => {
    try {
      // Create or get conversation
      const result = await getOrCreateConversation(
        user.username,
        availableUser.userId,
        user.role,
        availableUser.role
      );

      // Add to conversations list if not already there
      if (!conversations.find((c) => c._id === result.conversationId)) {
        setConversations((prev) => [result.conversation, ...prev]);
      }

      // Select the conversation
      setActiveConversation(result.conversation);
      setSelectedUser({ userId: availableUser.userId, role: availableUser.role });
      setShowAvailableUsers(false);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal-container">
        <div className="chat-modal-header">
          <h2>Chat Support</h2>
          <button onClick={onClose} className="chat-close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="chat-modal-content">
          {/* Conversations List */}
          <div className="chat-conversations-list">
            <div className="chat-conversations-header">
              <h3>Conversations</h3>
              <button
                onClick={() => setShowAvailableUsers(!showAvailableUsers)}
                className="chat-add-conversation-btn"
                title="Start new chat"
              >
                +
              </button>
            </div>

            {loading ? (
              <div className="chat-loading">
                <FaSpinner className="animate-spin" /> Loading...
              </div>
            ) : showAvailableUsers ? (
              <div className="chat-available-users">
                <div className="chat-available-header">
                  <button
                    onClick={() => setShowAvailableUsers(false)}
                    className="chat-back-btn"
                  >
                    ← Back
                  </button>
                  <span>New Chat</span>
                </div>
                {availableUsers.length === 0 ? (
                  <div className="chat-empty">No users available</div>
                ) : (
                  availableUsers.map((availableUser) => (
                    <div
                      key={availableUser.userId}
                      className="chat-available-user-item"
                      onClick={() => handleStartNewConversation(availableUser)}
                    >
                      <div className="chat-conversation-avatar">
                        {availableUser.userId[0].toUpperCase()}
                      </div>
                      <div className="chat-conversation-info">
                        <div className="chat-conversation-name">
                          {availableUser.userId}
                          {availableUser.isOnline && (
                            <FaCircle
                              className="chat-online-indicator"
                              size={8}
                            />
                          )}
                        </div>
                        <div className="chat-conversation-last-message">
                          {availableUser.role}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : conversations.length === 0 ? (
              <div className="chat-empty">
                <p>No conversations yet</p>
                <button
                  onClick={() => setShowAvailableUsers(true)}
                  className="chat-start-chat-btn"
                >
                  Start a new chat
                </button>
              </div>
            ) : (
              <div className="chat-conversations">
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const isOnline = getOnlineStatus(otherParticipant.userId);

                  return (
                    <div
                      key={conversation._id}
                      className={`chat-conversation-item ${
                        activeConversation?._id === conversation._id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="chat-conversation-avatar">
                        {otherParticipant.userId[0].toUpperCase()}
                      </div>
                      <div className="chat-conversation-info">
                        <div className="chat-conversation-name">
                          {otherParticipant.userId}
                          {isOnline && (
                            <FaCircle
                              className="chat-online-indicator"
                              size={8}
                            />
                          )}
                        </div>
                        <div className="chat-conversation-last-message">
                          {conversation.lastMessage?.content || "No messages"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="chat-messages-area">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="chat-messages-header">
                  <div className="chat-header-info">
                    <div className="chat-header-name">
                      {selectedUser?.userId}
                      {getOnlineStatus(selectedUser?.userId) && (
                        <span className="chat-online-badge">Online</span>
                      )}
                    </div>
                    <div className="chat-header-status">
                      {selectedUser?.role}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                  {messages.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={`chat-message ${
                        message.senderId === user.username
                          ? "sent"
                          : "received"
                      }`}
                    >
                      <div className="chat-message-content">
                        {message.content}
                      </div>
                      <div className="chat-message-footer">
                        <span className="chat-message-time">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.senderId === user.username && (
                          <span className="chat-message-status">
                            {message.status === "read" && "✓✓"}
                            {message.status === "delivered" && "✓"}
                            {message.status === "sent" && "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {typingUsers[activeConversation._id] && (
                    <div className="chat-message received typing">
                      <div className="chat-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    className="chat-input"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="chat-send-btn"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </>
            ) : (
              <div className="chat-empty-state">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
