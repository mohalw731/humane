"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  doc, setDoc, getDoc, collection, query, where, getDocs, 
  updateDoc, arrayUnion, arrayRemove, deleteDoc, onSnapshot 
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import useUserData from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster, toast } from "react-hot-toast";
import { Copy, Plus, Trash2, Shield, ShieldOff } from "lucide-react";

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

interface Todo {
  id: string;
  text: string;
  userId: string;
}

export default function RoomManager() {
  const { user, loading } = useUserData();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinKey, setJoinKey] = useState("");
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userTodos, setUserTodos] = useState<Record<string, Todo[]>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?mode=login");
    }
  }, [user, loading, router]);

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
      setAllUsers(usersData);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const fetchUserTodos = async (userId: string) => {
    try {
      const q = query(collection(db, 'todos'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const todosData: Todo[] = [];
        querySnapshot.forEach((doc) => {
          todosData.push({ id: doc.id, ...doc.data() } as Todo);
        });
        setUserTodos(prev => ({
          ...prev,
          [userId]: todosData
        }));
      });
      return unsubscribe;
    } catch (error) {
      toast.error("Failed to fetch todos");
    }
  };

  useEffect(() => {
    if (activeRoom) {
      const unsubscribeFunctions: (() => void)[] = [];
      
      activeRoom.members.forEach(memberId => {
        const unsubscribe = fetchUserTodos(memberId);
        if (unsubscribe) {
          unsubscribeFunctions.push(unsubscribe as any);
        }
      });

      return () => {
        unsubscribeFunctions.forEach(unsub => unsub());
      };
    }
  }, [activeRoom]);

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

  const deleteRoom = async (roomId: string) => {
    if (!user?.isAdmin) return;

    try {
      await deleteDoc(doc(db, "rooms", roomId));
      toast.success("Room deleted successfully!");
      fetchUserRooms();
      setActiveRoom(null);
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (!user?.isAdmin) return;

    try {
      await updateDoc(doc(db, "usersData", userId), {
        isAdmin: !currentStatus,
      });
      toast.success(`User ${!currentStatus ? "promoted to admin" : "demoted from admin"}`);
      fetchAllUsers();
    } catch (error) {
      toast.error("Failed to update admin status");
    }
  };

  const removeUserFromRoom = async (userId: string) => {
    if (!user?.isAdmin || !activeRoom) return;

    try {
      await updateDoc(doc(db, "rooms", activeRoom.id), {
        members: arrayRemove(userId),
      });
      toast.success("User removed from room");
      fetchUserRooms();
    } catch (error) {
      toast.error("Failed to remove user");
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
      <h1 className="text-2xl font-bold mb-6">{user.isAdmin ? "Admin Room Manager" : "Room Manager"}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <div className="flex gap-2">
                        {user.isAdmin && (
                          <>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRoom(room.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Members: {room.members.length} {room.adminId === user?.uid && "(Admin)"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <>
                      <TableRow key={member.uid}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.isAdmin ? "Yes" : "No"}</TableCell>
                        {user.isAdmin && (
                          <TableCell className="flex gap-2">
                            {member.uid !== user.uid && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleAdminStatus(member.uid, member.isAdmin)}
                                >
                                  {member.isAdmin ? (
                                    <ShieldOff className="h-4 w-4 text-yellow-500" />
                                  ) : (
                                    <Shield className="h-4 w-4 text-green-500" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeUserFromRoom(member.uid)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                      
                      {/* Todos for each user - admin only */}
                      {user.isAdmin && userTodos[member.uid]?.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={user.isAdmin ? 4 : 3}>
                            <div className="pl-4 border-l-4 border-gray-200">
                              <h4 className="font-medium mb-2">Todos:</h4>
                              <ul className="space-y-1">
                                {userTodos[member.uid].map(todo => (
                                  <li key={todo.id} className="flex justify-between items-center">
                                    <span>{todo.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {user.isAdmin && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((userData) => (
                  <TableRow key={userData.uid}>
                    <TableCell>{userData.name}</TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>{userData.isAdmin ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {userData.uid !== user.uid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAdminStatus(userData.uid, userData.isAdmin)}
                        >
                          {userData.isAdmin ? (
                            <ShieldOff className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Shield className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}