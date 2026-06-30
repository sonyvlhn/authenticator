"use client"
import { useEffect, useState } from "react";

export default function Welcome() {
  interface User {
    name: string;
  }

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/user').then((res) => res.json()).then((data) => {
      setUser(data);
    });
  }, []);

  const userName = user?.name;

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-16 bg-white rounded-xl shadow-sm border border-slate-200 m-2 ml-0 sm:items-start overflow-auto">
      <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
        <h1 className="max-w-md text-3xl font-semibold leading-10 tracking-tight text-slate-800">
          Bem-vindo, {userName}!
        </h1>
        <p className="max-w-md text-lg leading-7 text-slate-600">
          Este é um exemplo de página protegida por autenticação.
        </p>
      </div>
    </main>
  )
}
