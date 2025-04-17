import { Calendar, Home } from "lucide-react";
import React from "react";

export default function Sidebar() {
  return (
    <nav className="bg-white w-[400px] h-[97vh] py-10 rounded-xl px-6 shadow-2xl text-black">
      <ul className="space-y-3">
        <li className=" text-slate-900 flex items-center justify-between gap-4  font-medium hover:bg-slate-200 p-2 px-3 rounded-md">
          <div className="flex items-center text-base gap-4">
            <Home className="size-4" /> Home
          </div>
          <span className="bg-slate-100 text-slate-400 p-1 px-2 text-xs rounded-md">
            12
          </span>
        </li>
        
        <li className=" text-slate-900 flex items-center justify-between gap-4  font-medium hover:bg-slate-200 p-2 px-3 rounded-md">
          <div className="flex items-center gap-4 text-base">
            <Calendar className="size-4" /> Today
          </div>
          <span className="bg-slate-100 text-slate-400 p-1 px-2 text-xs rounded-md">
            12
          </span>
        </li>
       
      </ul>
    </nav>
  );
}
