import { useEffect, useState } from "react";
import {
  ChatMessage,
  subscribeToMessages,
  sendMessage
} from "@/lib/messages.service";

export function useChatMessages(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);

    const unsub = subscribeToMessages(roomId, msgs => {
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsub();
  }, [roomId]);

  return {
    messages,
    loading,
    sendMessage
  };
}
