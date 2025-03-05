// src/components/ClassroomChat.tsx
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Course, ChatMessage } from "@/utils/types";

const ClassroomChat: React.FC<{ course: Course }> = ({ course }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: {
        id: course.instructor.id,
        username: course.instructor.username,
        initial: course.instructor.initial,
        firstName: "",
        lastName: "",
        email: "",
        avatar: "",
      },
      text: "Welcome to the classroom chat! Feel free to ask questions here.",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      sender: {
        id: "student1",
        username: "AlexJohnson",
        initial: "A",
        firstName: "",
        lastName: "",
        email: "",
        avatar: "",
      },
      text: "Hi everyone! Can someone help me understand the last lecture?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newChat: ChatMessage = {
        id: Date.now().toString(),
        sender: {
          id: "currentUser",
          username: "You",
          initial: "Y",
          firstName: "",
          lastName: "",
          email: "",
          avatar: "",
        },
        text: newMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newChat]);
      setNewMessage("");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-[600px] overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender.id === "currentUser";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-end space-x-2",
                isCurrentUser ? "justify-end" : "justify-start"
              )}
            >
              {/* User Avatar (only for others) */}
              {!isCurrentUser && (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                    "bg-green-500"
                  )}
                >
                  {msg.sender.initial}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={cn(
                  "px-3 py-2 rounded-lg max-w-[70%] break-words",
                  isCurrentUser
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isCurrentUser ? "text-blue-100" : "text-gray-600"
                  )}
                >
                  {msg.sender.username}
                </p>
                <p className="text-sm">{msg.text}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    isCurrentUser ? "text-blue-100" : "text-gray-500"
                  )}
                >
                  {formatTimestamp(msg.timestamp)}
                </p>
              </div>

              {/* User Avatar (only for current user, on the right) */}
              {isCurrentUser && (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                    "bg-blue-500"
                  )}
                >
                  {msg.sender.initial}
                </div>
              )}
            </div>
          );
        })}
        {/* Scroll to bottom ref */}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-0 text-sm py-2"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 aspect-square"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClassroomChat;