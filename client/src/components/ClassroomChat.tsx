// src/components/ClassroomChat.tsx
import React, { useState, useRef, useEffect } from "react";
import { Send, Video, X, Mic, MicOff, VideoOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Course, ChatMessage } from "@/utils/types";

const ClassroomChat: React.FC<{ course: Course }> = ({ course }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: {
        id: course.admin.id,
        username: course.admin.username,
        initial: course.admin.initial,
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

  // Video call states
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participants, setParticipants] = useState([
    { id: "instructor", name: course.admin.username, isInstructor: true },
    { id: "currentUser", name: "You", isCurrentUser: true },
    { id: "student1", name: "Alex Johnson" },
    { id: "student2", name: "Maria Garcia" },
  ]);

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

  const startVideoCall = () => {
    setIsVideoCallActive(true);
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-full overflow-hidden relative">
      {/* Chat Header with Video Call Button */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h3 className="font-medium text-gray-800">{course.name} Chat</h3>
        <Button
          onClick={startVideoCall}
          variant="ghost"
          className="rounded-full p-2 hover:bg-gray-200 absolute top-1.5 right-5  -translate-x-1/2"
          title="Start video call"
        >
          <Video className="w-6 h-6 text-blue-500" />
        </Button>
      </div>

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

      {/* Video Call Overlay */}
      {isVideoCallActive && (
        <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
          {/* Video Call Header */}
          <div className="p-4 flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
            <h3 className="font-medium text-lg">{course.name} Video Call</h3>
            <Button
              onClick={endVideoCall}
              variant="ghost"
              className="rounded-full p-2 hover:bg-gray-700"
              title="End call"
            >
              <X className="w-6 h-6 text-red-400" />
            </Button>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto bg-gray-800">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={cn(
                  "rounded-xl overflow-hidden relative bg-gray-700 shadow-lg transition-all duration-300",
                  participant.isInstructor
                    ? "sm:col-span-2 lg:col-span-3"
                    : "col-span-1"
                )}
              >
                {/* Placeholder video feed */}
                <div className="w-full h-full flex items-center justify-center bg-gray-800 aspect-video relative">
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-medium transition-transform duration-300",
                      participant.isInstructor
                        ? "bg-green-500"
                        : participant.isCurrentUser
                        ? "bg-blue-500"
                        : "bg-purple-500",
                      !isVideoOn && participant.isCurrentUser && "scale-110"
                    )}
                  >
                    {participant.name.charAt(0)}
                  </div>
                  {/* Video/Mic status indicators */}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    {participant.isCurrentUser && !isMicOn && (
                      <MicOff className="w-5 h-5 text-red-500 bg-gray-900/80 p-1 rounded-full" />
                    )}
                    {participant.isCurrentUser && !isVideoOn && (
                      <VideoOff className="w-5 h-5 text-red-500 bg-gray-900/80 p-1 rounded-full" />
                    )}
                  </div>
                </div>

                {/* User name label */}
                <div className="absolute bottom-3 left-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {participant.name}{" "}
                  {participant.isInstructor && "(Instructor)"}
                </div>
              </div>
            ))}
          </div>

          {/* Video Call Controls */}
          <div className="p-4 bg-gradient-to-t from-gray-900 to-gray-800 flex items-center justify-center space-x-4 shadow-lg">
            <Button
              onClick={() => setIsMicOn(!isMicOn)}
              variant="ghost"
              className={cn(
                "rounded-full p-3 aspect-square transition-all duration-200",
                isMicOn
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {isMicOn ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </Button>

            <Button
              onClick={() => setIsVideoOn(!isVideoOn)}
              variant="ghost"
              className={cn(
                "rounded-full p-3 aspect-square transition-all duration-200",
                isVideoOn
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {isVideoOn ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </Button>

            <Button
              onClick={endVideoCall}
              className="bg-red-600 hover:bg-red-700 rounded-full px-6 py-2 text-white font-medium transition-all duration-200"
            >
              End Call
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomChat;
