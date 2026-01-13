import { ChevronDown, Hash, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ChatRoom {
  id: string;
  name: string;
  type: 'general' | 'year' | 'branch';
  category?: string;
}

interface ChatRoomSelectorProps {
  rooms: ChatRoom[];
  selectedRoom: string;
  onRoomChange: (roomId: string) => void;
  userRole?: 'student' | 'admin' | 'superadmin';
}

export function ChatRoomSelector({
  rooms,
  selectedRoom,
  onRoomChange,
}: ChatRoomSelectorProps) {
  const generalRooms = rooms.filter((r) => r.type === 'general');
  const yearRooms = rooms.filter((r) => r.type === 'year');
  const branchRooms = rooms.filter((r) => r.type === 'branch');

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);

  return (
    <Select value={selectedRoom} onValueChange={onRoomChange}>
      <SelectTrigger className="w-[220px] bg-secondary border-border text-foreground focus:ring-1 focus:ring-success/50">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Select a room">
            {selectedRoomData?.name || 'Select a room'}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-card border-border z-50">
        {generalRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1.5">
              General
            </SelectLabel>
            {generalRooms.map((room) => (
              <SelectItem
                key={room.id}
                value={room.id}
                className="cursor-pointer focus:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{room.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {yearRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1.5 mt-2">
              Year-wise
            </SelectLabel>
            {yearRooms.map((room) => (
              <SelectItem
                key={room.id}
                value={room.id}
                className="cursor-pointer focus:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{room.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {branchRooms.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1.5 mt-2">
              Branch-wise
            </SelectLabel>
            {branchRooms.map((room) => (
              <SelectItem
                key={room.id}
                value={room.id}
                className="cursor-pointer focus:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{room.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
