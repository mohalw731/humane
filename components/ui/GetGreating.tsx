import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/configs/firebase";

export function Greeting() {
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth() || {};

  useEffect(() => {
    const fetchUserName = async () => {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, "usersData", user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name); // Assumes 'name' field exists
          setLoading(false);

        }
      }       
    };

    fetchUserName();

    // Rest of the greeting logic (same as above)
    const hour = new Date().getHours();
    if (hour < 4) setGreeting("Good Night");
    else if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else if (hour < 21) setGreeting("Good Evening");
    else setGreeting("Good Night");

    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(`It's ${new Date().toLocaleDateString('en-US', options)}`);
  }, [user]);

  return (
    <div className="gap-1 flex flex-col w-full"> {/* Added w-full */}
      <h1 className="text-4xl text-slate-800 font-semibold">
        {greeting}{userName ? `, ${loading ? 'loading...' : userName.split(' ')[0]}` : ''}
      </h1>
      <h2 className="text-slate-400 text-2xl">
        {currentDate}
      </h2>
    </div>
  );
}