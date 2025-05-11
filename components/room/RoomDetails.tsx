import React from 'react';

type User = {
  uid: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

type RoomDetailsProps = {
  room: {
    name: string;
    members: string[];
  };
  users: User[];
  isAdmin: boolean;
  currentUserId: string;
  onToggleAdminStatus: (userId: string, currentStatus: boolean) => void;
  onRemoveUser: (userId: string) => void;
};

export const RoomDetails: React.FC<RoomDetailsProps> = ({
  room,
  users,
  isAdmin,
  currentUserId,
  onToggleAdminStatus,
  onRemoveUser,
}) => {
  return (
    <div className="border border-[#2D2D30] rounded-lg p-4 mt-6 bg-[#18181B]">
      <h2 className="text-lg font-bold mb-4 text-white">
        {room.name} - Members ({room.members.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2D2D30]">
              <th className="text-left pb-2 text-gray-400">Name</th>
              <th className="text-left pb-2 text-gray-400">Email</th>
              <th className="text-left pb-2 text-gray-400">Admin</th>
              {isAdmin && <th className="text-left pb-2 text-gray-400">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {room.members.map((memberId) => {
              const member = users.find((u) => u.uid === memberId);
              if (!member) return null;

              return (
                <tr key={member.uid} className="border-b border-[#2D2D30]">
                  <td className="py-3 text-white">{member.name}</td>
                  <td className="text-gray-400">{member.email}</td>
                  <td className={member.isAdmin ? "text-green-400" : "text-gray-400"}>
                    {member.isAdmin ? 'Yes' : 'No'}
                  </td>
                  {isAdmin && (
                    <td className="flex gap-2 py-3">
                      {member.uid !== currentUserId && (
                        <>
                          <button
                            onClick={() => onToggleAdminStatus(member.uid, member.isAdmin)}
                            className="px-2 py-1 bg-[#3A3A3D] text-white rounded hover:bg-[#4A4A4D] text-sm"
                          >
                            {member.isAdmin ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            onClick={() => onRemoveUser(member.uid)}
                            className="px-2 py-1 bg-red-900 text-red-300 rounded hover:bg-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};