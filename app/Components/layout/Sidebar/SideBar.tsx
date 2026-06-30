"use client"
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // A estilização do botão será aplicada de acordo com a página atual, exemplo: se estiver na página Produtos, o botão Produtos, da sidebar, será estilizado de acordo com a estilização de página ativa e os outros serão estilizados de acordo com a página inativa
  const linkClass = (href: string) =>
    /* O primeiro são as classes CSS base que serão aplicadas aos botões */
    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 
    ${!isOpen ? "justify-center" : "" /* Se o isOpen for true, o botão será centralizado, se for false, o botão será centralizado */
    } ${pathname === href
      ? "bg-slate-800 text-white"/* Se o caminho da página for igual ao caminho do botão, o botão será estilizado de acordo com a estilização de página ativa */
      : "text-slate-400 hover:bg-slate-800 hover:text-white"
  }`;

  async function handleLogout(): Promise<void> {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/");
    router.refresh();
  }

  const toggle = () => {
    setIsOpen(prevState => !prevState); 
  }

  return (
    <div className={`text-white bg-linear-to-br from-gray-900 to-gray-700 h-[calc(100vh-1rem)] border border-slate-700 rounded-xl p-4 m-2 shrink-0 flex flex-col shadow-lg transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div>
        <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} transition-all duration-300`}>
          {isOpen && <h2 className="text-xl font-bold tracking-wide truncate">Administração</h2>}
          <button onClick={toggle} className="flex flex-col gap-1 p-1 hover:bg-slate-800/50 rounded-lg transition-colors focus:outline-none" aria-label="Toggle Menu">
            <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>

        <nav className="flex flex-col gap-2 mt-6">
          <a href="/Paginas" className={linkClass("/Paginas")} title="Páginas">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isOpen && <span className="transition-opacity duration-300">Páginas</span>}
          </a>

          <a href="/Produtos" className={linkClass("/Produtos")} title="Produtos">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {isOpen && <span className="transition-opacity duration-300">Produtos</span>}
          </a>

          <a href="/Usuarios" className={linkClass("/Usuarios")} title="Usuários">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {isOpen && <span className="transition-opacity duration-300">Usuários</span>}
          </a>
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 py-2.5 rounded-lg bg-slate-100 text-slate-900 transition-all duration-300 hover:bg-red-600 hover:text-white font-semibold shadow-md ${isOpen ? 'px-4 justify-start' : 'justify-center'}`}
          title="Sair"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isOpen && <span className="transition-opacity duration-300">Sair</span>} { /* Significa que o span só será renderizado se o isOpen for true */}
        </button>
        {isOpen && <div className="text-center text-xs text-slate-500 transition-opacity duration-300">v1.0.0</div>} {/* Significa que a div só será renderizada se o isOpen for true */}
      </div>
    </div>
  )
}
