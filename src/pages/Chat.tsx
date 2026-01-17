import { useState, useRef, useEffect } from "react";
import { MessageCircle, Users } from "lucide-react";

import { ChatRoomSelector } from "@/components/chat/ChatRoomSelector";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/hooks/useAuth";
import { useChatRooms } from "@/hooks/useChatRooms";
import { useChatMessages } from "@/hooks/useChatMessages";

export default function ChatPage() {
  const { user } = useAuth();
  console.log(user);

  // rooms from Firestore
  const { rooms, loading: roomsLoading } = useChatRooms(user);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>("general");

  // messages from Firestore (realtime)
  const {
    messages,
    loading: messagesLoading,
    sendMessage
  } = useChatMessages(selectedRoomId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  return (
    <div className="chat-container h-[calc(100vh-7rem)]">
      {/* NAVBAR */}
      <div className="chat-navbar">
        <div className="flex items-center gap-4">
          <ChatRoomSelector
            rooms={rooms}
            selectedRoom={selectedRoomId ?? ""}
            onRoomChange={setSelectedRoomId}
            userRole={user.role}
            loading={roomsLoading}
          />

          {selectedRoom && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRoom.type === "general" && "Everyone can view"}
                {selectedRoom.type === "semester" &&
                  `Semester ${selectedRoom.semester} students`}
              </span>
            </div>
          )}
        </div>


      </div>

      {/* MESSAGES */}
      <div className="chat-messages">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No messages yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to start the conversation
            </p>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                message={{
                  id: msg.id,
                  content: msg.text,
                  senderId: msg.senderId,
                  senderName: msg.senderId === user.uid ? "You" : "User",
                  timestamp: msg.createdAt?.toDate?.() ?? new Date(),
                  isOwn: msg.senderId === user.uid
                }}
                showSenderName={msg.senderId !== user.uid}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* INPUT */}
      {selectedRoomId && (
        <ChatInput
          onSend={(text) => sendMessage(selectedRoomId, text)}
          placeholder={`Message #${selectedRoom?.title ?? "chat"}...`}
        />
      )}
    </div>
  );
}
