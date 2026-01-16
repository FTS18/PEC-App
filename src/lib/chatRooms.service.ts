import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { ChatRoom } from "@/types/chat";

export async function fetchChatRooms(user: {
  role: string;
  semester?: number;
  department?: string;
  organizationId: string;
}) {
  if (!user.organizationId) {
    return [];
  }

  const roomsRef = collection(db, "chatRooms");

  // 1. Check for correct role strings: "admin" or "super_admin"
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  // 2. Fetch rooms belonging to the user's organization
  // This is better for performance than fetching the whole collection
  const q = query(
    roomsRef,
    where("organizationId", "==", user.organizationId)
  );

  const snap = await getDocs(q);
  const allRooms = snap.docs.map(d => ({ id: d.id, ...d.data() }) as ChatRoom);

  // 3. Admin / Super Admin logic
  if (isAdmin) {
    // Admins see everything within their organization
    return allRooms;
  }

  // 4. Student Filtering logic
  return allRooms.filter(room => {
    // Always allow general rooms
    if (room.type === "general") return true;

    // Only allow their specific semester
    if (room.type === "semester") {
      return room.semester === user.semester;
    }

    // Only allow their specific department
    if (room.type === "department") {
      return room.department === user.department;
    }

    return false;
  });
}