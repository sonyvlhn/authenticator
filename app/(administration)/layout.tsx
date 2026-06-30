import React from "react";
import SideBar from "../Components/layout/Sidebar/SideBar";

export default async function Administration({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row bg-slate-100 font-sans">
      <SideBar />
      {children}
    </div>
  );
}
