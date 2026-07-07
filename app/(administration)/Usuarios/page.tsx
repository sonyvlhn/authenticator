"use client";

import { useEffect, useState } from "react";
import ModalUsuarios from "@/app/Components/layout/modalUsuarios/ModalUsuarios";
import ModalConfirm from "@/app/Components/layout/modalConfirm/ModalConfirm";

type TipoAcesso = "VISUALIZADOR" | "EDITOR" | "ADMIN";

const TIPO_ACESSO_LABEL: Record<TipoAcesso, string> = {
  VISUALIZADOR: "Visualizador",
  EDITOR: "Editor",
  ADMIN: "Admin",
};

const TIPO_ACESSO_STYLE: Record<TipoAcesso, string> = {
  VISUALIZADOR: "bg-slate-100 text-slate-700",
  EDITOR: "bg-blue-50 text-blue-700",
  ADMIN: "bg-purple-50 text-purple-700",
};

type Usuario = {
  id: string;
  name: string;
  email: string;
  acessoLiberado: boolean;
  tipoAcesso: TipoAcesso;
  createdAt: string;
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState<string | null>(null);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // busca os usuários cadastrados no banco de dados
  function fetchUsuarios() {
    setIsLoading(true);
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch(() => setError("Não foi possível carregar os usuários."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchUsuarios();
  }, []);

  function handleEditar(usuario: Usuario) {
    setUsuarioSelecionadoId(usuario.id);
  }

  function handleExcluir(usuario: Usuario) {
    setUsuarioParaExcluir(usuario);
  }

  async function confirmarExclusao() {
    if (!usuarioParaExcluir) return;

    setIsDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/usuarios/${usuarioParaExcluir.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Não foi possível excluir o usuário.");
        return;
      }

      fetchUsuarios();
      setUsuarioParaExcluir(null);
    } catch {
      setError("Erro na conexão.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
    <main className="flex flex-1 flex-col p-4 h-[calc(100vh-1rem)] bg-white rounded-xl shadow-sm border border-slate-200 m-2 ml-0 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black">
          Listagem de Usuários
        </h1>
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Carregando usuários...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : usuarios.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhum usuário cadastrado.</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-slate-500 font-medium">Nome</th>
                <th className="px-4 py-3 text-slate-500 font-medium">E-mail</th>
                <th className="px-4 py-3 text-slate-500 font-medium text-center">
                  Tipo de Acesso
                </th>
                <th className="px-4 py-3 text-slate-500 font-medium text-center">
                  Acesso
                </th>
                <th className="px-4 py-3 text-slate-500 font-medium text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {usuario.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{usuario.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${TIPO_ACESSO_STYLE[usuario.tipoAcesso]}`}
                    >
                      {TIPO_ACESSO_LABEL[usuario.tipoAcesso]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        usuario.acessoLiberado
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {usuario.acessoLiberado ? "Liberado" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditar(usuario)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-150 cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                          <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleExcluir(usuario)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors duration-150 cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <path
                            d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
    {usuarioSelecionadoId && (
      <ModalUsuarios
        onClose={() => setUsuarioSelecionadoId(null)}
        onSaved={fetchUsuarios}
        usuarioId={usuarioSelecionadoId}
      />
    )}
    {usuarioParaExcluir && (
      <ModalConfirm
        title="Excluir usuário"
        message={`Deseja realmente excluir o usuário "${usuarioParaExcluir.name}"?`}
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir"}
        cancelLabel="Cancelar"
        isConfirming={isDeleting}
        onConfirm={confirmarExclusao}
        onCancel={() => setUsuarioParaExcluir(null)}
      />
    )}
    </>
  );
}
