export type ChatRoomType = "general" | "semester";

// in @/types/chat.ts
export interface ChatRoom {
  id: string;
  type: "general" | "semester" | "department";
  title: string;
  organizationId: string;
  semester?: number;
  department?: string; // Change departmentName to department here
  createdAt: any;
}