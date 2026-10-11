import React from "react";
import { redirect } from "next/navigation";
import SideBar from "../Components/layout/Sidebar/SideBar";
import { obterUsuarioLogado } from "@/lib/sessao";

export default async function Administration({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bloqueia a área administrativa para quem não está logado ou ainda não teve o acesso liberado pelo admin
  const usuario = await obterUsuarioLogado();
  if (!usuario) {
    redirect("/");
  }

  return (
    <div className="flex flex-row bg-slate-100 font-sans">
      <SideBar usuario={usuario} />
      {children}
    </div>
  );
}
