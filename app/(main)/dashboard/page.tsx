"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import useUserData from "@/hooks/useUser";
import { toast } from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";
import Navbar from "@/components/layout/navbar/Navbar";
import { Greeting } from "@/components/ui/GetGreating";
import { JoinRoomModal } from "@/components/room/JoinRoomModal";
import { RoomList } from "@/components/room/RoomList";
import { RoomDetails } from "@/components/room/RoomDetails";
import { CreateRoomModal } from "@/components/room/createRoom";
import AudioTranscriber from "@/components/test";

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

export default function Page() {
  const { loading, isLoggedIn } = useAuth();
  const { user, loading: userDataLoading } = useUserData();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinKey, setJoinKey] = useState("");
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [joinRoomOpen, setJoinRoomOpen] = useState(false);



  useEffect(() => {
    if (user) {
      fetchUserRooms();
      fetchAllUsers();
    }
  }, [user]);

  const fetchUserRooms = async () => {
    try {
      const q = query(
        collection(db, "rooms"),
        where("members", "array-contains", user?.uid)
      );
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

  const createRoom = async () => {
    if (!user?.isAdmin) return;

    if (!newRoomName.trim()) {
      toast.error("Room name is required");
      return;
    }

    try {
      const accessKey = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();
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
      setCreateRoomOpen(false);
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
      const q = query(
        collection(db, "rooms"),
        where("accessKey", "==", joinKey)
      );
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
      setJoinRoomOpen(false);
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
      toast.success(
        `User ${!currentStatus ? "promoted to admin" : "demoted from admin"}`
      );
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



  if (loading || userDataLoading ) return <Loader />;
  if (!isLoggedIn) return router.push("/auth?mode=login");

  return (
    <div className="">
      <Navbar />
      

      <div className="flex gap-4 mb-6 w-full items-center justify-between">
        <Greeting />
       <div className="flex gap- items-center">
       <CreateRoomModal
          isAdmin={user?.isAdmin || false}
          isOpen={createRoomOpen}
          onOpenChange={setCreateRoomOpen}
          roomName={newRoomName}
          onRoomNameChange={setNewRoomName}
          onCreate={createRoom}
        />
        <JoinRoomModal
          isOpen={joinRoomOpen}
          onOpenChange={setJoinRoomOpen}
          accessKey={joinKey}
          onAccessKeyChange={setJoinKey}
          onJoin={joinRoom}
        />
       </div>
      </div>

      <RoomList
        rooms={rooms}
        activeRoomId={activeRoom?.id || null}
        isAdmin={user?.isAdmin || false}
        currentUserId={user?.uid || "" }
        onRoomClick={setActiveRoom}
        onCopyAccessKey={copyToClipboard}
        onDeleteRoom={deleteRoom}
      />

      {activeRoom && (
        <RoomDetails
          room={activeRoom}
          users={users}
          isAdmin={user?.isAdmin || false}
          currentUserId={user?.uid || ""}
          onToggleAdminStatus={toggleAdminStatus}
          onRemoveUser={removeUserFromRoom}
        />
      )}

      <AudioTranscriber apiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""}/>
    </div>
  );
}
