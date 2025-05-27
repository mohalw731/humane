"use client";

import useUserData from "@/hooks/useUser";

export function Greeting() {
  const { user } = useUserData();

  return (
    <h1 className="md:text-3xl  text-2xl text-white font-light mb-5">
      Välkommen tillbaka,{" "}
      <span className="text-[#E0B9E0]">{user?.name?.split(" ")[0]}</span>{" "}
      <span className="wave">👋</span>
    </h1>
  );
}
