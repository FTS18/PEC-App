import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "@/config/firebase";

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export function subscribeToMessages(
  roomId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const messagesRef = collection(db, "chatRooms", roomId, "messages");

  const q = query(messagesRef, orderBy("createdAt"));

  return onSnapshot(q, snap => {
    const msgs = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as ChatMessage[];

    callback(msgs);
  });
}

export async function sendMessage(roomId: string, text: string) {
  if (!auth.currentUser) return;

  const messagesRef = collection(db, "chatRooms", roomId, "messages");

  await addDoc(messagesRef, {
    senderId: auth.currentUser.uid,
    text,
    createdAt: serverTimestamp()
  });
}
