"use client";
import { useEffect, useState } from "react";

type Categoria = {
  id: string;
  nome: string;
};

export type ProdutoEdicao = {
  id: string;
  nome: string;
  categoriaId: string;
  descricao: string;
  preco: number;
  imagemUrl?: string | null;
};

export default function ModalProdutos({
  onClose,
  onSaved,
  produto,
}: {
  onClose: () => void;
  onSaved: () => void;
  produto?: ProdutoEdicao | null;
}) {
  const isEditing = !!produto;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    produto?.imagemUrl ?? null
  );
  const [temDesconto, setTemDesconto] = useState(false);
  const [closing, setClosing] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // busca as categorias cadastradas para popular o select
  useEffect(() => {
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((e) => console.log(e));
  }, []);

  // handleClose é responsável por fechar o modal
  const handleClose = () => {
    setClosing(true); //inicia a animação de fechamento, setando o estado para true
    setTimeout(() => {
      setSelectedImage(null);
      setPreviewUrl(null);
      setTemDesconto(false);
      onClose(); //fecha o modal
    }, 180); //o tempo é o mesmo que a animação de fechamento, então quando o tempo acabar, o modal já terá fechado
  };

  // handleImageChange é responsável por receber a imagem do produto
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // handleRemoveImage é responsável por remover a imagem do produto
  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  async function handleSubmitNewProduto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Impede o comportamento padrão de submit do form (reload/navegação), que abortaria o fetch antes da resposta chegar
    const formData = new FormData(e.currentTarget); // O FormData é uma classe nativa do javascript que permite criar objetos a partir de formulários.
    try {
      const url = isEditing ? `/api/produtos/${produto!.id}` : "/api/produtos";
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        body: formData,
      });
      const data = await response.json();
      console.log(data);
      onSaved();
      handleClose();
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${closing ? "animate-backdrop-out" : "animate-backdrop-in"}`}
    >
      <form
        onSubmit={handleSubmitNewProduto}
        className={`bg-white p-6 rounded-xl w-full max-w-md mx-4 flex flex-col gap-6 shadow-2xl ${closing ? "animate-modal-out" : "animate-modal-in"}`}
      >
        <h2 className="text-xl font-semibold text-slate-900 text-center">
          {isEditing ? "Editar Produto" : "Crie seu Produto"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 col-span-2">
            <span className="text-sm font-medium text-slate-700">
              Imagem do Produto
            </span>
            {previewUrl ? (
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition-colors duration-200"
                  title="Remover imagem"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            ) : (
              <label
                htmlFor="imageInput"
                className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-4 pb-4 px-3 text-center">
                  <svg
                    className="w-8 h-8 mb-2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="text-sm font-medium text-slate-700">
                    Clique para enviar
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG ou WEBP
                  </p>
                </div>
                <input
                  type="file"
                  id="imageInput"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
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
              placeholder="Nome do Produto"
              defaultValue={produto?.nome}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="categoria"
              className="text-sm font-medium text-slate-700"
            >
              Categoria
            </label>
            <select
              id="categoria"
              name="categoriaId"
              defaultValue={produto?.categoriaId ?? ""}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black cursor-pointer bg-white"
            >
              <option value="" className="text-slate-400 bg-white">
                Selecione uma categoria
              </option>
              {categorias.map((categoria) => (
                <option
                  key={categoria.id}
                  value={categoria.id}
                  className="text-slate-800 bg-white"
                >
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 col-span-2">
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
              defaultValue={produto?.descricao}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="preco"
              className="text-sm font-medium text-slate-700"
            >
              Preço
            </label>
            <input
              type="number"
              step="0.01"
              id="preco"
              name="preco"
              placeholder="R$ 0,00"
              defaultValue={produto?.preco}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black"
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-700">
                O produto é novo na loja?
              </p>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="novo"
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black cursor-pointer"
                />
                <span className="text-gray-400 text-xs">
                  Marque somente se o produto for novo
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-700">
                O produto tem desconto?
              </p>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="desconto"
                  checked={temDesconto}
                  onChange={(e) => setTemDesconto(e.target.checked)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black cursor-pointer"
                />
                <span className="text-gray-400 text-xs">
                  Marque somente se o produto tiver desconto
                </span>
              </div>
            </div>
            {temDesconto && (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="porcentagem"
                  className="text-sm font-medium text-slate-700"
                >
                  Porcentagem do desconto
                </label>
                <input
                  type="number"
                  id="porcentagem"
                  placeholder="%"
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-black"
                />
              </div>
            )}
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
            className="bg-slate-900 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
          >
            {isEditing ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </form>
    </div>
  );
}
