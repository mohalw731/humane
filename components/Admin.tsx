"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/configs/firebase";
import useUserData from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster, toast } from "react-hot-toast";
import { Copy, Plus } from "lucide-react";

interface Room {
  id: string;
  name: string;
  adminId: string;
  accessKey: string;
  members: string[];
}

interface User {
  uid: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function RoomManager() {
  const { user, loading } = useUserData();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinKey, setJoinKey] = useState("");
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);



  useEffect(() => {
    if (user) {
      fetchUserRooms();
      fetchAllUsers();
    }
  }, [user]);

  const fetchUserRooms = async () => {
    try {
      const q = query(collection(db, "rooms"), where("members", "array-contains", user?.uid));
      const querySnapshot = await getDocs(q);
      const roomsData: Room[] = [];
      querySnapshot.forEach((doc) => {
        roomsData.push({ id: doc.id, ...doc.data() } as Room);
      });
      setRooms(roomsData);
    } catch (error) {
      toast.error("Failed to fetch rooms");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usersData"));
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ uid: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const createRoom = async () => {
    if (!user?.isAdmin) return;

    if (!newRoomName.trim()) {
      toast.error("Room name is required");
      return;
    }

    try {
      const accessKey = Math.random().toString(36).substring(2, 10).toUpperCase();
      const roomRef = doc(collection(db, "rooms"));
      await setDoc(roomRef, {
        name: newRoomName,
        adminId: user?.uid,
        accessKey,
        members: [user?.uid],
        createdAt: new Date().toISOString(),
      });

      toast.success("Room created successfully!");
      setNewRoomName("");
      fetchUserRooms();
    } catch (error) {
      toast.error("Failed to create room");
    }
  };

  const joinRoom = async () => {
    if (!joinKey.trim()) {
      toast.error("Access key is required");
      return;
    }

    try {
      const q = query(collection(db, "rooms"), where("accessKey", "==", joinKey));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Invalid access key");
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data() as Room;

      if (roomData.members.includes(user?.uid || "")) {
        toast.error("You're already in this room");
        return;
      }

      await updateDoc(doc(db, "rooms", roomDoc.id), {
        members: arrayUnion(user?.uid),
      });

      toast.success("Joined room successfully!");
      setJoinKey("");
      fetchUserRooms();
    } catch (error) {
      toast.error("Failed to join room");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-6">Room Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room Creation Section (only for admins) */}
        {user.isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Room</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <Button onClick={createRoom} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Create Room
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Join Room Section */}
        <Card>
          <CardHeader>
            <CardTitle>Join Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Access key"
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value)}
              />
              <Button onClick={joinRoom} className="w-full">
                Join Room
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Your Rooms Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rooms.length === 0 ? (
                <p>No rooms yet</p>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-3 border rounded-lg cursor-pointer ${activeRoom?.id === room.id ? "bg-gray-100" : ""}`}
                    onClick={() => setActiveRoom(room)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{room.name}</span>
                      {user.isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(room.accessKey);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Members: {room.members.length}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Details Section */}
      {activeRoom && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {activeRoom.name} - Members ({activeRoom.members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin</TableHead>
                  {user.isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRoom.members.map((memberId) => {
                  const member = users.find((u) => u.uid === memberId);
                  if (!member) return null;

                  return (
                    <TableRow key={member.uid}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.isAdmin ? "Yes" : "No"}</TableCell>
                      {user.isAdmin && (
                        <TableCell>
                          {member.uid !== activeRoom.adminId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Only admins can remove users
                                if (user.isAdmin) {
                                  updateDoc(doc(db, "rooms", activeRoom.id), {
                                    members: arrayRemove(member.uid),
                                  }).then(() => {
                                    toast.success("User removed");
                                    fetchUserRooms();
                                  });
                                }
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}