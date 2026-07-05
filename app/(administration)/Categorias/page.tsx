"use client";

import { useEffect, useState } from "react";
import ModalCategorias from "@/app/Components/layout/modalCategorias/ModalCategorias";
import ModalConfirm from "@/app/Components/layout/modalConfirm/ModalConfirm";

type Categoria = {
  id: string;
  nome: string;
  descricao: string | null;
  _count: { produtos: number };
};

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<string | null>(null);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<Categoria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // busca as categorias cadastradas no banco de dados
  function fetchCategorias() {
    setIsLoading(true);
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch(() => setError("Não foi possível carregar as categorias."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchCategorias();
  }, []);

  function handleAdicionar() {
    setCategoriaSelecionadaId(null);
    setIsOpen(true);
  }

  function handleEditar(categoria: Categoria) {
    setCategoriaSelecionadaId(categoria.id);
    setIsOpen(true);
  }

  function handleExcluir(categoria: Categoria) {
    if (categoria._count.produtos > 0) return;
    setCategoriaParaExcluir(categoria);
  }

  async function confirmarExclusao() {
    if (!categoriaParaExcluir) return;

    setIsDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/categorias/${categoriaParaExcluir.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Não foi possível excluir a categoria.");
        return;
      }

      fetchCategorias();
      setCategoriaParaExcluir(null);
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
          Listagem de Categorias
        </h1>
        <button
          onClick={handleAdicionar}
          className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer">
          + Adicionar Categoria
        </button>
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Carregando categorias...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : categorias.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-slate-500 font-medium">Nome</th>
                <th className="px-4 py-3 text-slate-500 font-medium">
                  Descrição
                </th>
                <th className="px-4 py-3 text-slate-500 font-medium text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorias.map((categoria) => (
                <tr
                  key={categoria.id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {categoria.nome}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {categoria.descricao || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditar(categoria)}
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
                        onClick={() => handleExcluir(categoria)}
                        disabled={categoria._count.produtos > 0}
                        title={
                          categoria._count.produtos > 0
                            ? "Não é possível excluir uma categoria vinculada a produtos"
                            : undefined
                        }
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-50">
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
    {isOpen && (
      <ModalCategorias
        onClose={() => setIsOpen(false)}
        onSaved={fetchCategorias}
        categoriaId={categoriaSelecionadaId}
      />
    )}
    {categoriaParaExcluir && (
      <ModalConfirm
        title="Excluir categoria"
        message={`Deseja realmente excluir a categoria "${categoriaParaExcluir.nome}"?`}
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir"}
        cancelLabel="Cancelar"
        isConfirming={isDeleting}
        onConfirm={confirmarExclusao}
        onCancel={() => setCategoriaParaExcluir(null)}
      />
    )}
    </>
  );
}
