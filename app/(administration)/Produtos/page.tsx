"use client";

import { useEffect, useState } from "react";
import ModalProdutos from "@/app/Components/layout/modalProdutos/ModalProdutos";
import { calcularPrecoComDesconto, temDesconto } from "@/lib/desconto";

type Categoria = {
  id: string;
  nome: string;
};

type Produto = {
  id: string;
  nome: string;
  categoriaId: string;
  categoria: Categoria;
  descricao: string;
  preco: number;
  descontoPorcentagem: number;
  emDestaque: boolean;
  imagemUrl: string | null; // foto de destaque, exibida no card
  imagens: { id: string; url: string }[];
};

function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  // busca os produtos cadastrados no banco de dados
  function fetchProdutos() {
    setIsLoading(true);
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch(() => setError("Não foi possível carregar os produtos."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchProdutos();
  }, []);

  function handleAdicionar() {
    setProdutoSelecionado(null);
    setIsOpen(true);
  }

  function handleEditar(produto: Produto) {
    setProdutoSelecionado(produto);
    setIsOpen(true);
  }

  return (
    <>
    <main className="flex flex-1 flex-col p-4 h-[calc(100vh-1rem)] bg-white rounded-xl shadow-sm border border-slate-200 m-2 ml-0 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black">
          Listagem de Produtos
        </h1>
        <button
          onClick={handleAdicionar}
          className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer">
          + Adicionar Produto
        </button>
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Carregando produtos...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : produtos.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhum produto cadastrado.</p>
      ) : (
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="w-24 px-4 py-3 text-slate-500 font-medium text-center">
                Imagem
              </th>
              <th className="px-4 py-3 text-slate-500 font-medium">Nome</th>
              <th className="px-4 py-3 text-slate-500 font-medium">
                Categoria
              </th>
              <th className="px-4 py-3 text-slate-500 font-medium">Preço</th>
              <th className="px-4 py-3 text-slate-500 font-medium text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {produtos.map((produto) => (
              <tr
                key={produto.id}
                className="hover:bg-slate-50 transition-colors duration-150"
              >
                <td className="px-4 py-3 text-center">
                  <div className="w-14 h-14 mx-auto rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden">
                    {produto.imagemUrl ? (
                      <img
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {produto.nome}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {produto.categoria?.nome}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {temDesconto(produto.descontoPorcentagem) ? (
                    <div className="flex flex-col">
                      {/* Preço original riscado e, abaixo, o preço com desconto */}
                      <span className="text-xs text-slate-400 line-through">
                        {formatarPreco(produto.preco)}
                      </span>
                      <span className="flex items-center gap-2 font-semibold text-emerald-700">
                        {formatarPreco(calcularPrecoComDesconto(produto.preco, produto.descontoPorcentagem))}
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          -{produto.descontoPorcentagem.toLocaleString("pt-BR")}%
                        </span>
                      </span>
                    </div>
                  ) : (
                    formatarPreco(produto.preco)
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditar(produto)}
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
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors duration-150 cursor-pointer">
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
      <ModalProdutos
        onClose={() => setIsOpen(false)}
        onSaved={fetchProdutos}
        produto={
          produtoSelecionado
            ? {
                id: produtoSelecionado.id,
                nome: produtoSelecionado.nome,
                categoriaId: produtoSelecionado.categoriaId,
                descricao: produtoSelecionado.descricao,
                preco: produtoSelecionado.preco,
                descontoPorcentagem: produtoSelecionado.descontoPorcentagem,
                emDestaque: produtoSelecionado.emDestaque,
                imagemUrl: produtoSelecionado.imagemUrl,
                imagens: produtoSelecionado.imagens,
              }
            : null
        }
      />
    )}
    </>
  );
}
