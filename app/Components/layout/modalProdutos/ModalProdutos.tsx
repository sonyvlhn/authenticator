"use client";
import { useEffect, useState } from "react";
import { MAX_FOTOS_PRODUTO } from "@/lib/validations";

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
  descontoPorcentagem?: number;
  imagemUrl?: string | null; // foto de destaque
  imagens?: { id: string; url: string }[]; // fotos já salvas do produto
};

// Foto exibida na galeria do modal: já salva no storage (id) ou nova, ainda não enviada (arquivo)
type Foto = {
  chave: string;
  url: string; // URL do storage ou URL temporária do navegador (preview)
  id?: string;
  arquivo?: File;
};

const TIPOS_ACEITOS = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB, o mesmo limite da API

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
  const [fotos, setFotos] = useState<Foto[]>(
    () => produto?.imagens?.map((imagem) => ({ chave: imagem.id, url: imagem.url, id: imagem.id })) ?? []
  );
  // foto de destaque: ao editar, a que já estava salva como destaque (ou a primeira)
  const [destaque, setDestaque] = useState<string | null>(
    () => produto?.imagens?.find((imagem) => imagem.url === produto.imagemUrl)?.id ?? produto?.imagens?.[0]?.id ?? null
  );
  const [temDesconto, setTemDesconto] = useState(
    (produto?.descontoPorcentagem ?? 0) > 0 // ao editar, já abre marcado se o produto tiver desconto
  );
  const [closing, setClosing] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  // Categoria controlada por estado: com defaultValue, o valor salvo se perdia porque as opções
  // só chegam da API depois da primeira renderização do select
  const [categoriaId, setCategoriaId] = useState(produto?.categoriaId ?? "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // busca as categorias cadastradas para popular o select
  useEffect(() => {
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((e) => console.log(e));
  }, []);

  // libera da memória as URLs temporárias de preview das fotos novas
  const liberarPreviews = (lista: Foto[]) => {
    lista.filter((foto) => foto.arquivo).forEach((foto) => URL.revokeObjectURL(foto.url));
  };

  // handleClose é responsável por fechar o modal
  const handleClose = () => {
    setClosing(true); //inicia a animação de fechamento, setando o estado para true
    setTimeout(() => {
      liberarPreviews(fotos);
      setFotos([]);
      setTemDesconto(false);
      onClose(); //fecha o modal
    }, 180); //o tempo é o mesmo que a animação de fechamento, então quando o tempo acabar, o modal já terá fechado
  };

  // handleImageChange recebe as fotos escolhidas (até completar o limite de 5)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selecionadas = Array.from(e.target.files ?? []);
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois de removê-lo
    if (selecionadas.length === 0) return;

    const validas = selecionadas.filter((arquivo) => TIPOS_ACEITOS.includes(arquivo.type) && arquivo.size <= TAMANHO_MAXIMO);
    const vagas = MAX_FOTOS_PRODUTO - fotos.length;
    const adicionadas = validas.slice(0, vagas);

    const avisos: string[] = [];
    if (validas.length < selecionadas.length) avisos.push("Algumas fotos foram ignoradas: use PNG, JPG, WEBP ou GIF com até 5 MB.");
    if (validas.length > vagas) avisos.push(`O produto pode ter no máximo ${MAX_FOTOS_PRODUTO} fotos.`);
    setError(avisos.join(" "));

    const novas: Foto[] = adicionadas.map((arquivo) => ({
      chave: crypto.randomUUID(),
      url: URL.createObjectURL(arquivo),
      arquivo,
    }));
    setFotos((atuais) => [...atuais, ...novas]);
    // se ainda não havia destaque, a primeira foto adicionada vira o destaque
    if (!destaque && novas[0]) setDestaque(novas[0].chave);
  };

  // handleRemoveImage remove uma foto da galeria
  const handleRemoveImage = (chave: string) => {
    const restantes = fotos.filter((foto) => foto.chave !== chave);
    liberarPreviews(fotos.filter((foto) => foto.chave === chave));
    setFotos(restantes);
    // se a foto removida era o destaque, a primeira restante assume
    if (destaque === chave) setDestaque(restantes[0]?.chave ?? null);
  };

  async function handleSubmitNewProduto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Impede o comportamento padrão de submit do form (reload/navegação), que abortaria o fetch antes da resposta chegar
    const formData = new FormData(e.currentTarget); // O FormData é uma classe nativa do javascript que permite criar objetos a partir de formulários.

    // Fotos: as novas vão como arquivos, as já salvas como lista de ids, e o destaque indica qual delas vai para o card
    const novas = fotos.filter((foto) => foto.arquivo);
    novas.forEach((foto) => formData.append("imagens", foto.arquivo!));
    formData.set("imagensMantidas", JSON.stringify(fotos.filter((foto) => foto.id).map((foto) => foto.id)));
    const fotoDestaque = fotos.find((foto) => foto.chave === destaque);
    if (fotoDestaque) {
      formData.set("destaque", fotoDestaque.id ? `existente:${fotoDestaque.id}` : `nova:${novas.indexOf(fotoDestaque)}`);
    }

    setError("");
    setIsSaving(true);
    try {
      const url = isEditing ? `/api/produtos/${produto!.id}` : "/api/produtos";
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Não foi possível salvar o produto.");
        return;
      }
      onSaved();
      handleClose();
    } catch (e) {
      console.log(e);
      setError("Erro na conexão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${closing ? "animate-backdrop-out" : "animate-backdrop-in"}`}
    >
      <form
        onSubmit={handleSubmitNewProduto}
        className={`bg-white p-6 rounded-xl w-full max-w-md mx-4 max-h-[90dvh] overflow-y-auto flex flex-col gap-6 shadow-2xl ${closing ? "animate-modal-out" : "animate-modal-in"}`}
      >
        <h2 className="text-xl font-semibold text-slate-900 text-center">
          {isEditing ? "Editar Produto" : "Crie seu Produto"}
        </h2>
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-red-500 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 col-span-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-700">
                Fotos do Produto
              </span>
              <span className="text-xs text-slate-400">
                {fotos.length}/{MAX_FOTOS_PRODUTO}
              </span>
            </div>
            {/* Cada foto ocupa 1 fração e o quadro de upload ocupa as frações restantes das 5:
                sem fotos ele usa a largura toda e vai diminuindo conforme as fotos são adicionadas */}
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns:
                  fotos.length < MAX_FOTOS_PRODUTO
                    ? `repeat(${fotos.length}, minmax(0, 1fr)) minmax(0, ${MAX_FOTOS_PRODUTO - fotos.length}fr)`
                    : `repeat(${MAX_FOTOS_PRODUTO}, minmax(0, 1fr))`,
              }}
            >
              {fotos.map((foto) => {
                const ehDestaque = foto.chave === destaque;
                return (
                  <div
                    key={foto.chave}
                    className={`relative aspect-square rounded-lg overflow-hidden bg-slate-50 border-2 transition-colors duration-200 ${ehDestaque ? "border-amber-400" : "border-slate-200"}`}
                  >
                    <img src={foto.url} alt="Foto do produto" className="h-full w-full object-cover" />
                    {/* Estrela: escolhe a foto de destaque, usada no card do produto */}
                    <button
                      type="button"
                      onClick={() => setDestaque(foto.chave)}
                      title={ehDestaque ? "Foto de destaque" : "Usar como destaque"}
                      aria-label={ehDestaque ? "Foto de destaque" : "Usar como destaque"}
                      aria-pressed={ehDestaque}
                      className={`absolute top-1 left-1 p-1 rounded-full transition-colors duration-200 ${ehDestaque ? "bg-amber-400 text-white" : "bg-black/50 text-white hover:bg-black/70"}`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={ehDestaque ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                        <path strokeLinejoin="round" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(foto.chave)}
                      title="Remover foto"
                      aria-label="Remover foto"
                      className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full transition-colors duration-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {ehDestaque && (
                      <span className="absolute bottom-0 inset-x-0 bg-amber-400/90 text-white text-[10px] font-semibold text-center py-0.5">
                        Destaque
                      </span>
                    )}
                  </div>
                );
              })}
              {fotos.length < MAX_FOTOS_PRODUTO && (
                <label
                  htmlFor="imageInput"
                  // sem fotos tem altura própria; com fotos acompanha a altura das miniaturas
                  className={`${fotos.length === 0 ? "h-28" : "h-full"} flex flex-col items-center justify-center text-center px-2 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all duration-200 text-slate-400`}
                >
                  <svg className={fotos.length === 0 ? "w-8 h-8" : "w-6 h-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {/* com mais espaço livre, o texto fica mais descritivo */}
                  {fotos.length === 0 ? (
                    <>
                      <span className="text-sm font-medium text-slate-700 mt-1">Clique para enviar fotos</span>
                      <span className="text-xs mt-0.5">Até {MAX_FOTOS_PRODUTO} fotos</span>
                    </>
                  ) : (
                    // com 4 fotos o quadro fica estreito: no celular mostra só o ícone
                    <span className={`text-[11px] font-medium mt-1 ${fotos.length >= 4 ? "hidden sm:inline" : ""}`}>
                      {fotos.length <= 2 ? "Adicionar fotos" : "Adicionar"}
                    </span>
                  )}
                  {/* sem "name": as fotos são adicionadas ao FormData manualmente no envio */}
                  <input
                    type="file"
                    id="imageInput"
                    multiple
                    accept={TIPOS_ACEITOS.join(",")}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Até {MAX_FOTOS_PRODUTO} fotos (PNG, JPG, WEBP ou GIF, máx. 5 MB cada). Toque na ★ para escolher a foto de destaque do card.
            </p>
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
              required
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
              required
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
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
              min={0.01}
              required
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
                  name="descontoPorcentagem"
                  min={0}
                  max={100}
                  step="0.01"
                  required
                  defaultValue={produto?.descontoPorcentagem || undefined}
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
            disabled={isSaving}
            className="disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
          >
            {isSaving ? "Salvando..." : isEditing ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </form>
    </div>
  );
}
