import { Hash, Users, Building2, ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatRoom } from "@/types/chat";
import { UserRole } from "@/types";

interface Props {
  rooms: ChatRoom[];
  selectedRoom: string;
  onRoomChange: (id: string) => void;
  loading?: boolean;
  userRole: UserRole; // We use this to determine visibility
}

export function ChatRoomSelector({
  rooms,
  selectedRoom,
  onRoomChange,
  loading,
  userRole,
}: Props) {
  // 1. Determine if the user is a restricted student
  const isStudent = userRole === "student";

  // 2. Logic: If not a student, they see ALL rooms. 
  // If a student, the 'rooms' array should already be pre-filtered by your fetch function.
  const generalRooms = rooms.filter((r) => r.type === "general");
  const semesterRooms = rooms.filter((r) => r.type === "semester");
  const departmentRooms = rooms.filter((r) => r.type === "department");

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);

  return (
    <Select value={selectedRoom} onValueChange={onRoomChange}>
      <SelectTrigger className="w-[260px] bg-secondary border-border">
        <div className="flex items-center gap-2">
          {/* Visual indicator if Admin is viewing */}
          {!isStudent ? (
            <ShieldCheck className="w-4 h-4 text-primary" />
          ) : (
            <Hash className="w-4 h-4 text-muted-foreground" />
          )}
          <SelectValue placeholder={loading ? "Loading…" : "Select a room"}>
            {selectedRoomData?.title}
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className="bg-card border-border z-50 max-h-[400px]">
        {/* SECTION 1: GENERAL */}
        {generalRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider px-2 py-1.5">
              Community
            </SelectLabel>
            {generalRooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>{room.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {/* SECTION 2: DEPARTMENTS */}
        {departmentRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider px-2 py-1.5 mt-2">
              {isStudent ? "Your Department" : "All Departments"}
            </SelectLabel>
            {departmentRooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[190px]">
                    {room.department || room.title}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {/* SECTION 3: SEMESTERS */}
        {semesterRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider px-2 py-1.5 mt-2">
              {isStudent ? "Your Semester" : "All Semesters"}
            </SelectLabel>
            {semesterRooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" />
                  <span>{room.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}