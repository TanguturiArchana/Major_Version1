import { useEffect, useState } from "react";
import { chatService } from "../../services/chatService";
import { subscribe } from "../../services/socketService";
import "./Chat.css";

const Chat = ({ applicationId, ownerId, workerId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Fetch messages initially
  useEffect(() => {
    const fetch = async () => {
      const data = await chatService.getMessages(applicationId);
      setMessages(data);
    };
    fetch();

    // Subscribe to real-time chat updates (topic per application)
    const sub = subscribe(`/topic/chat/${applicationId}`, (msg) => {
      // avoid duplicates: if a message with same senderId and text already exists, skip
      setMessages((prev) => {
        const exists = prev.some(m => m.senderId === msg.senderId && String(m.message).trim() === String(msg.message).trim());
        if (exists) return prev;
        return [...prev, msg];
      });
    });
    return () => sub.unsubscribe();
  }, [applicationId]);

  // ✅ Send new message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // optimistic update
    const optimistic = {
      applicationId,
      senderId: ownerId,
      receiverId: workerId,
      message: newMessage,
      sentAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await chatService.sendMessage({
        applicationId,
        senderId: ownerId,
        receiverId: workerId,
        message: newMessage,
        senderType: "OWNER",
      });
      // replace optimistic message with server persisted message
      setMessages((prev) => prev.map(m => (m.optimistic && m.message === optimistic.message && m.senderId === optimistic.senderId) ? saved : m));
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message.');
    }
    setNewMessage("");
  };

  return (
    <div className="chat-overlay">
      <div className="chat-modal">
        <div className="chat-header">
          <h3>💬 Chat with Worker</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="chat-body">
          {messages.length === 0 ? (
            <p className="empty-msg">No messages yet.</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`message-bubble ${
                  msg.senderId === ownerId ? "sent" : "received"
                }`}
              >
                {msg.message}
              </div>
            ))
          )}
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
