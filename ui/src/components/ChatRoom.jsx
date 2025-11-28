import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const ChatRoom = ({ username, room }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingMsg, setTypingMsg] = useState("");
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3001");
    }
    const socket = socketRef.current;
    socket.emit("join_room", room);

    const messageHandler = (data) => setMessages((prev) => [...prev, data]);

    const typingHandler = (data) => {
      if (data !== username) {
        setTypingMsg(`${data} is typing...`);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingMsg(""), 1500);
      }
    };

    socket.on("receive_message", messageHandler);
    socket.on("user_typing", typingHandler);

    return () => {
      socket.off("receive_message", messageHandler);
      socket.off("user_typing", typingHandler);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [room, username]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const messageData = {
      room,
      author: username,
      message,
      id: crypto.randomUUID(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    socketRef.current.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setMessage("");
  };

  const handleTyping = () => {
    socketRef.current.emit("typing", username, room);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl h-[600px] bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-white text-gray-800 font-semibold p-4 text-lg border-b shadow-sm">
        {room} - {username}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.author === username ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm  ${
                msg.author === username
                  ? "bg-blue-200 text-gray-900 rounded-tr-none"
                  : "bg-white text-gray-900 rounded-tl-none"
              }`}
            >
              <div className="text-sm">{msg.message}</div>
              <div
                className={`text-xs text-gray-400 mt-1 ${
                  msg.author === username ? "text-right" : "text-left"
                }`}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {typingMsg && (
        <div className="px-4 py-1 text-sm italic text-gray-500">{typingMsg}</div>
      )}

      <div className="flex p-4 bg-white border-t shadow-inner">
        <input
          type="text"
          value={message}
          placeholder="Type a message..."
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

ChatRoom.propTypes = {
  username: PropTypes.string.isRequired,
  room: PropTypes.string.isRequired,
};

export default ChatRoom;
