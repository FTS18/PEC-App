import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Users } from 'lucide-react';
import { ChatRoomSelector, ChatRoom } from '@/components/chat/ChatRoomSelector';
import { ChatMessage, Message } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { Badge } from '@/components/ui/badge';

// Placeholder data - replace with actual data from your backend
const PLACEHOLDER_ROOMS: ChatRoom[] = [
  { id: 'general', name: 'General Chat', type: 'general' },
  { id: 'year-1', name: '1st Year', type: 'year' },
  { id: 'year-2', name: '2nd Year', type: 'year' },
  { id: 'year-3', name: '3rd Year', type: 'year' },
  { id: 'year-4', name: '4th Year', type: 'year' },
  { id: 'branch-cse', name: 'CSE', type: 'branch' },
  { id: 'branch-ece', name: 'ECE', type: 'branch' },
  { id: 'branch-me', name: 'Mechanical', type: 'branch' },
  { id: 'branch-ce', name: 'Civil', type: 'branch' },
  { id: 'branch-ee', name: 'Electrical', type: 'branch' },
];

const PLACEHOLDER_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Hey everyone! Has anyone completed the DBMS assignment?',
    senderId: 'user-1',
    senderName: 'Rahul Sharma',
    timestamp: new Date(Date.now() - 3600000),
    isOwn: false,
  },
  {
    id: '2',
    content: 'Yes, I finished it yesterday. The normalization part was tricky.',
    senderId: 'user-2',
    senderName: 'Priya Patel',
    timestamp: new Date(Date.now() - 3500000),
    isOwn: false,
  },
  {
    id: '3',
    content: 'I\'m still working on the ER diagram. Need some help with the relationships.',
    senderId: 'current-user',
    senderName: 'You',
    timestamp: new Date(Date.now() - 3400000),
    isOwn: true,
  },
  {
    id: '4',
    content: 'I can help! Which entities are you having trouble with?',
    senderId: 'user-2',
    senderName: 'Priya Patel',
    timestamp: new Date(Date.now() - 3300000),
    isOwn: false,
  },
  {
    id: '5',
    content: 'The student-course enrollment relationship. Should it be many-to-many?',
    senderId: 'current-user',
    senderName: 'You',
    timestamp: new Date(Date.now() - 3200000),
    isOwn: true,
  },
  {
    id: '6',
    content: 'Yes, it should be M:N. A student can enroll in multiple courses and a course can have multiple students.',
    senderId: 'user-3',
    senderName: 'Amit Kumar',
    timestamp: new Date(Date.now() - 3100000),
    isOwn: false,
  },
  {
    id: '7',
    content: 'Don\'t forget to add the enrollment date as an attribute of the relationship!',
    senderId: 'user-2',
    senderName: 'Priya Patel',
    timestamp: new Date(Date.now() - 3000000),
    isOwn: false,
  },
];

// Simulated current user (replace with actual auth context)
const CURRENT_USER = {
  id: 'current-user',
  name: 'You',
  role: 'student' as const,
};

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [messages, setMessages] = useState<Message[]>(PLACEHOLDER_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      timestamp: new Date(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
    // In real implementation, fetch messages for the new room
    // For now, just clear or keep the placeholder messages
  };

  const selectedRoomData = PLACEHOLDER_ROOMS.find((r) => r.id === selectedRoom);
  const onlineCount = 12; // Placeholder - replace with actual count

  return (
    <div className="flex flex-col  ">
      {/* Chat Navbar */}
      <div className="chat-navbar">
        <div className="flex items-center gap-4">
          <ChatRoomSelector
            rooms={PLACEHOLDER_ROOMS}
            selectedRoom={selectedRoom}
            onRoomChange={handleRoomChange}
            userRole={CURRENT_USER.role}
          />
          {selectedRoomData && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRoomData.type === 'general' && 'Everyone can view'}
                {selectedRoomData.type === 'year' && `${selectedRoomData.name} students`}
                {selectedRoomData.type === 'branch' && `${selectedRoomData.name} department`}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs bg-secondary border-border">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <Users className="w-3 h-3" />
            <span>{onlineCount} online</span>
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No messages yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Be the first to start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                showSenderName={!message.isOwn}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSendMessage}
        placeholder={`Message #${selectedRoomData?.name || 'chat'}...`}
      />
    </div>
  );
}
