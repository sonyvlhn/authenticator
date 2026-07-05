"use client";
import { useEffect, useState } from "react";

type CategoriaDetalhe = {
  id: string;
  nome: string;
  descricao: string | null;
  _count: { produtos: number };
};

export default function ModalCategorias({
  onClose,
  onSaved,
  categoriaId,
}: {
  onClose: () => void;
  onSaved: () => void;
  categoriaId?: string | null;
}) {
  const isEditing = !!categoriaId;
  const [closing, setClosing] = useState(false);
  const [isLoadingCategoria, setIsLoadingCategoria] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDetalhe | null>(null);

  // busca as informações da categoria selecionada para edição
  useEffect(() => {
    if (!categoriaId) return;
    setIsLoadingCategoria(true);
    fetch(`/api/categorias/${categoriaId}`)
      .then((res) => res.json())
      .then((data) => setCategoria(data))
      .catch(() => setError("Não foi possível carregar a categoria."))
      .finally(() => setIsLoadingCategoria(false));
  }, [categoriaId]);

  const temProdutosVinculados = (categoria?._count.produtos ?? 0) > 0;

  // handleClose é responsável por fechar o modal
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  async function handleSubmitCategoria(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const nome = formData.get("nome") as string;
    const descricao = formData.get("descricao") as string;

    try {
      const url = isEditing ? `/api/categorias/${categoriaId}` : "/api/categorias";
      const method = isEditing ? "PATCH" : "POST";
      const body = temProdutosVinculados ? { descricao } : { nome, descricao };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Não foi possível salvar a categoria.");
        return;
      }

      onSaved();
      handleClose();
    } catch {
      setError("Erro na conexão.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${closing ? "animate-backdrop-out" : "animate-backdrop-in"}`}
    >
      {isLoadingCategoria ? (
        <div className="bg-white p-6 rounded-xl w-full max-w-md mx-4 shadow-2xl">
          <p className="text-slate-500 text-sm text-center">Carregando categoria...</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmitCategoria}
          className={`bg-white p-6 rounded-xl w-full max-w-md mx-4 flex flex-col gap-6 shadow-2xl ${closing ? "animate-modal-out" : "animate-modal-in"}`}
        >
          <h2 className="text-xl font-semibold text-slate-900 text-center">
            {isEditing ? "Editar Categoria" : "Crie sua Categoria"}
          </h2>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="nome"
                className="text-sm font-medium text-slate-700"
              >
                Nome
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                placeholder="Nome da Categoria"
                defaultValue={categoria?.nome}
                required
                disabled={temProdutosVinculados}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
              {temProdutosVinculados && (
                <span className="text-xs text-slate-400">
                  Esta categoria está vinculada a produtos e o nome não pode ser alterado.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="descricao"
                className="text-sm font-medium text-slate-700"
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                placeholder="Descrição"
                defaultValue={categoria?.descricao ?? ""}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="border border-slate-300 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-slate-900 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              {isSaving ? "Salvando..." : isEditing ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
