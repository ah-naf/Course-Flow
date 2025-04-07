import React, { useState, useRef, useEffect } from "react";
import { Send, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Course, ChatMessage } from "@/utils/types";
import { useUserStore } from "@/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "@/api/api";
import { useGetMessage } from "@/hooks/useCourse";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

const ClassroomChat: React.FC<{ course: Course }> = ({ course }) => {
  const { data = [] } = useGetMessage(course.id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimeRef = useRef<number>(Date.now());
  const { user } = useUserStore();

  useEffect(() => {
    setMessages(data);
  }, [data]);

  const isTokenExpiringSoon = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return true;
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return decoded.exp * 1000 - Date.now() < 60000;
    } catch (error) {
      return true;
    }
  };

  const handleTokenRefresh = async () => {
    try {
      await refreshAccessToken();
      console.log("Access token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      toast.error("Session expired. Please login again.");
      setConnectionStatus("error");
      setErrorMessage("Authentication failed. Please login again.");
      return false;
    }
  };

  const sendWebSocketMessage = (messageType: string, payload: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = { type: messageType, ...payload };
      socketRef.current.send(JSON.stringify(message));
      lastMessageTimeRef.current = Date.now(); // Update last message time
      setMessages([...messages, message]);
      return true;
    }
    return false;
  };

  const initializeWebSocket = async () => {
    let token = localStorage.getItem("access_token");
    if (!token) {
      setConnectionStatus("error");
      setErrorMessage("Authentication required");
      return;
    }

    if (isTokenExpiringSoon()) {
      const success = await handleTokenRefresh();
      if (!success) return;
      token = localStorage.getItem("access_token")!;
    }

    if (socketRef.current) {
      socketRef.current.close(1000, "Normal closure");
      socketRef.current = null;
    }

    setConnectionStatus("connecting");

    const wsUrl = `ws://localhost:8080/api/v1/ws?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connection established");
      setConnectionStatus("connected");
      setErrorMessage("");
      lastMessageTimeRef.current = Date.now();

      // Start heartbeat
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000); // Ping every 30 seconds
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        lastMessageTimeRef.current = Date.now(); // Update on any message
        if (data.type === "chat_message" && data.course_id === course.id) {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === "pong") {
          console.log("Pong received from server");
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.onerror = () => {
      setConnectionStatus("error");
      setErrorMessage("Connection error. Retrying...");
    };

    socket.onclose = async (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setConnectionStatus("disconnected");
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);

      if (event.code === 1008 || event.code === 401) {
        const success = await handleTokenRefresh();
        if (success) initializeWebSocket();
      } else if (event.code !== 1000) {
        if (reconnectTimeoutRef.current)
          clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          initializeWebSocket();
        }, 3000);
      }
    };
  };

  useEffect(() => {
    initializeWebSocket();

    tokenRefreshIntervalRef.current = setInterval(async () => {
      if (isTokenExpiringSoon()) {
        const success = await handleTokenRefresh();
        if (success && socketRef.current?.readyState !== WebSocket.OPEN) {
          initializeWebSocket();
        }
      }
    }, 30000);

    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounted");
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (tokenRefreshIntervalRef.current)
        clearInterval(tokenRefreshIntervalRef.current);
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);
    };
  }, [course.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      const messagePayload = {
        type: "chat_message",
        course_id: course.id,
        from_id: user?.id,
        text: newMessage.trim(),
        sender: user,
        timestamp: new Date().toISOString(),
      } as ChatMessage;

      const sent = sendWebSocketMessage("chat_message", messagePayload);
      if (sent) {
        setNewMessage("");
      } else {
        toast.error("Failed to send message");
      }
    } else if (socketRef.current?.readyState !== WebSocket.OPEN) {
      toast.error("Not connected to chat server");
      initializeWebSocket();
    }
  };

  const handleReconnect = async () => {
    if (socketRef.current) {
      socketRef.current.close(1000, "Manual reconnect");
      socketRef.current = null;
    }
    setConnectionStatus("connecting");
    await initializeWebSocket();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case "connecting":
        return (
          <div className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
            Connecting...
          </div>
        );
      case "connected":
        return (
          <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
            Connected
          </div>
        );
      case "disconnected":
        return (
          <div className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center">
            Disconnected
            <Button
              size="sm"
              variant="ghost"
              className="ml-1"
              onClick={handleReconnect}
            >
              Reconnect
            </Button>
          </div>
        );
      case "error":
        return (
          <div className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
            Error
            <Button
              size="sm"
              variant="ghost"
              className="ml-1"
              onClick={handleReconnect}
            >
              Retry
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center">
          <h3 className="font-medium text-gray-800">{course.name} Chat</h3>
          {renderConnectionStatus()}
        </div>
        <Button
          onClick={() => {}}
          variant="ghost"
          className="rounded-full p-2 relative -left-5 -top-2 hover:bg-gray-200"
          title="Start video call"
        >
          <Video className="w-6 h-6 text-blue-500" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end space-x-2",
              msg.sender.id === user?.id ? "justify-end" : "justify-start"
            )}
          >
            {msg.sender.id !== user?.id && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.sender.avatar} />
                <AvatarFallback>
                  {msg.sender.firstName[0]}
                  {msg.sender.lastName[0]}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "px-3 py-2 rounded-lg max-w-[70%]",
                msg.sender.id === user?.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              )}
            >
              <p className="text-sm font-semibold">{msg.sender.username}</p>
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs mt-1">{formatTimestamp(msg.timestamp)}</p>
            </div>
            {msg.sender.id === user?.id && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.sender.avatar} />
                <AvatarFallback>
                  {msg.sender.firstName[0]}
                  {msg.sender.lastName[0]}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              connectionStatus === "connected"
                ? "Type your message..."
                : "Reconnect to send messages"
            }
            className="flex-1 rounded-full"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={connectionStatus !== "connected"}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-blue-500 hover:bg-blue-600 rounded-full p-2"
            disabled={connectionStatus !== "connected" || !newMessage.trim()}
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClassroomChat;

// {isVideoCallActive && (
//   <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
//     {/* Video Call Header */}
//     <div className="p-4 flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
//       <h3 className="font-medium text-lg">{course.name} Video Call</h3>
//       <Button
//         onClick={endVideoCall}
//         variant="ghost"
//         className="rounded-full p-2 hover:bg-gray-700"
//         title="End call"
//       >
//         <X className="w-6 h-6 text-red-400" />
//       </Button>
//     </div>

//     <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto bg-gray-800">
//       {participants.map((participant) => (
//         <div
//           key={participant.id}
//           className={cn(
//             "rounded-xl overflow-hidden relative bg-gray-700 shadow-lg transition-all duration-300",
//             participant.isInstructor
//               ? "sm:col-span-2 lg:col-span-3"
//               : "col-span-1"
//           )}
//         >
//           <div className="w-full h-full flex items-center justify-center bg-gray-800 aspect-video relative">
//             <div
//               className={cn(
//                 "w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-medium transition-transform duration-300",
//                 participant.isInstructor
//                   ? "bg-green-500"
//                   : participant.isCurrentUser
//                   ? "bg-blue-500"
//                   : "bg-purple-500",
//                 !isVideoOn && participant.isCurrentUser && "scale-110"
//               )}
//             >
//               {participant.name.charAt(0)}
//             </div>
//             <div className="absolute top-3 right-3 flex space-x-2">
//               {participant.isCurrentUser && !isMicOn && (
//                 <MicOff className="w-5 h-5 text-red-500 bg-gray-900/80 p-1 rounded-full" />
//               )}
//               {participant.isCurrentUser && !isVideoOn && (
//                 <VideoOff className="w-5 h-5 text-red-500 bg-gray-900/80 p-1 rounded-full" />
//               )}
//             </div>
//           </div>

//           <div className="absolute bottom-3 left-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 text-white px-3 py-1 rounded-lg text-sm font-medium">
//             {participant.name}{" "}
//             {participant.isInstructor && "(Instructor)"}
//           </div>
//         </div>
//       ))}
//     </div>
//     {/* Video Call Controls */}
//     <div className="p-4 bg-gradient-to-t from-gray-900 to-gray-800 flex items-center justify-center space-x-4 shadow-lg">
//       <Button
//         onClick={() => setIsMicOn(!isMicOn)}
//         variant="ghost"
//         className={cn(
//           "rounded-full p-3 aspect-square transition-all duration-200",
//           isMicOn
//             ? "bg-gray-600 hover:bg-gray-500"
//             : "bg-red-600 hover:bg-red-700"
//         )}
//       >
//         {isMicOn ? (
//           <Mic className="w-6 h-6 text-white" />
//         ) : (
//           <MicOff className="w-6 h-6 text-white" />
//         )}
//       </Button>

//       <Button
//         onClick={() => setIsVideoOn(!isVideoOn)}
//         variant="ghost"
//         className={cn(
//           "rounded-full p-3 aspect-square transition-all duration-200",
//           isVideoOn
//             ? "bg-gray-600 hover:bg-gray-500"
//             : "bg-red-600 hover:bg-red-700"
//         )}
//       >
//         {isVideoOn ? (
//           <Video className="w-6 h-6 text-white" />
//         ) : (
//           <VideoOff className="w-6 h-6 text-white" />
//         )}
//       </Button>

//       <Button
//         onClick={endVideoCall}
//         className="bg-red-600 hover:bg-red-700 rounded-full px-6 py-2 text-white font-medium transition-all duration-200"
//       >
//         End Call
//       </Button>
//     </div>
//   </div>
// )}
