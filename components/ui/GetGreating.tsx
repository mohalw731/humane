import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/configs/firebase";

export function Greeting() {
  const [userName, setUserName] = useState("");
  const { user } = useAuth() || {};

  useEffect(() => {
    const fetchUserName = async () => {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, "usersData", user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name); // Assumes 'name' field exists
        }
      }
    };

    fetchUserName();
  }, [user]);

  return (
    <h1 className="md:text-3xl  text-2xl text-white font-light">
      Welcome Back,{" "}
      <span className="text-[#E0B9E0]">{userName.split(" ")[0]}</span>{" "}
      <span className="wave">👋</span>
    </h1>
  );
}
