"use client";
import { useEffect, useState } from "react";

type TipoAcesso = "VISUALIZADOR" | "EDITOR" | "ADMIN";

const TIPOS_ACESSO: { value: TipoAcesso; label: string }[] = [
  { value: "VISUALIZADOR", label: "Visualizador" },
  { value: "EDITOR", label: "Editor" },
  { value: "ADMIN", label: "Admin" },
];

type UsuarioDetalhe = {
  id: string;
  name: string;
  email: string;
  acessoLiberado: boolean;
  tipoAcesso: TipoAcesso;
};

export default function ModalUsuarios({
  onClose,
  onSaved,
  usuarioId,
}: {
  onClose: () => void;
  onSaved: () => void;
  usuarioId: string;
}) {
  const [closing, setClosing] = useState(false);
  const [isLoadingUsuario, setIsLoadingUsuario] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState<UsuarioDetalhe | null>(null);

  // busca as informações do usuário selecionado para edição
  useEffect(() => {
    setIsLoadingUsuario(true);
    fetch(`/api/usuarios/${usuarioId}`)
      .then((res) => res.json())
      .then((data) => setUsuario(data))
      .catch(() => setError("Não foi possível carregar o usuário."))
      .finally(() => setIsLoadingUsuario(false));
  }, [usuarioId]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  async function handleSubmitUsuario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const acessoLiberado = formData.get("acessoLiberado") === "on";
    const tipoAcesso = formData.get("tipoAcesso") as TipoAcesso;

    try {
      const response = await fetch(`/api/usuarios/${usuarioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, acessoLiberado, tipoAcesso }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Não foi possível salvar o usuário.");
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
      {isLoadingUsuario ? (
        <div className="bg-white p-6 rounded-xl w-full max-w-md mx-4 shadow-2xl">
          <p className="text-slate-500 text-sm text-center">Carregando usuário...</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmitUsuario}
          className={`bg-white p-6 rounded-xl w-full max-w-md mx-4 flex flex-col gap-6 shadow-2xl ${closing ? "animate-modal-out" : "animate-modal-in"}`}
        >
          <h2 className="text-xl font-semibold text-slate-900 text-center">
            Editar Usuário
          </h2>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Nome do usuário"
                defaultValue={usuario?.name}
                required
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="E-mail do usuário"
                defaultValue={usuario?.email}
                required
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="tipoAcesso"
                className="text-sm font-medium text-slate-700"
              >
                Tipo de Acesso
              </label>
              <select
                id="tipoAcesso"
                name="tipoAcesso"
                defaultValue={usuario?.tipoAcesso ?? "VISUALIZADOR"}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black bg-white cursor-pointer"
              >
                {TIPOS_ACESSO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="acessoLiberado"
                name="acessoLiberado"
                defaultChecked={usuario?.acessoLiberado}
                className="size-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500 cursor-pointer"
              />
              <label
                htmlFor="acessoLiberado"
                className="text-sm font-medium text-slate-700 cursor-pointer"
              >
                Acesso à plataforma liberado
              </label>
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
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
