import React from 'react';

type Room = {
  id: string;
  name: string;
  members: string[];
  adminId: string;
  accessKey: string;
};

type RoomListProps = {
  rooms: Room[];
  activeRoomId: string | null;
  isAdmin: boolean;
  currentUserId: string;
  onRoomClick: (room: Room) => void;
  onCopyAccessKey: (key: string) => void;
  onDeleteRoom: (roomId: string) => void;
};

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  activeRoomId,
  isAdmin,
  currentUserId,
  onRoomClick,
  onCopyAccessKey,
  onDeleteRoom,
}) => {
  return (
    <div className="border border-[#2D2D30] rounded-lg p-4 bg-[#18181B]">
      <h2 className="text-lg font-bold mb-4 text-white">Your Rooms</h2>
      {rooms.length === 0 ? (
        <p className="text-gray-400">No rooms yet</p>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`p-3 border rounded-lg cursor-pointer ${
                activeRoomId === room.id ? 'bg-[#1F1F23]' : 'bg-[#1F1F23] border-[#2D2D30]'
              }`}
              onClick={() => onRoomClick(room)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{room.name}</span>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyAccessKey(room.accessKey);
                      }}
                      className="p-1 text-gray-400 hover:text-white hover:bg-[#2D2D30] rounded"
                    >
                      Copy
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRoom(room.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-[#2D2D30] rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-400">
                Members: {room.members.length} {room.adminId === currentUserId && "(Admin)"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};