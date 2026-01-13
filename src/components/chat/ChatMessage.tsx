import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatMessageProps {
  message: Message;
  showSenderName?: boolean;
}

export function ChatMessage({ message, showSenderName = true }: ChatMessageProps) {
  const formattedTime = message.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={cn(
        'flex flex-col gap-1 animate-fade-in',
        message.isOwn ? 'items-end' : 'items-start'
      )}
    >
      {showSenderName && !message.isOwn && (
        <span className="text-[11px] font-medium text-muted-foreground px-1">
          {message.senderName}
        </span>
      )}
      <div
        className={cn(
          'chat-bubble',
          message.isOwn ? 'chat-bubble-own' : 'chat-bubble-other'
        )}
      >
        <p className="leading-relaxed break-words">{message.content}</p>
      </div>
      <span
        className={cn(
          'text-[10px] text-muted-foreground px-1',
          message.isOwn ? 'text-right' : 'text-left'
        )}
      >
        {formattedTime}
      </span>
    </div>
  );
}
