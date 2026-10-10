import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarImagem, removerImagem, lerArquivo, ErroUpload } from "@/lib/storage";
import { porcentagemValida } from "@/lib/desconto";

async function updateProduto(request: Request, id: string) {
  const formData = await request.formData();
  const nome = formData.get("nome") as string;
  const categoriaId = formData.get("categoriaId") as string;
  const descricao = formData.get("descricao") as string;
  const preco = parseFloat(formData.get("preco") as string);
  const descontoPorcentagem = parseFloat((formData.get("descontoPorcentagem") as string) || "0"); // sem desconto informado = 0%
  if (!porcentagemValida(descontoPorcentagem)) {
    return NextResponse.json({ error: "O desconto deve ser uma porcentagem entre 0 e 100" }, { status: 400 });
  }
  const imagem = lerArquivo(formData, "imageFile");
  const removerImagemAtual = formData.get("removerImagem") === "true";

  const produtoAtual = await prisma.produtos.findUnique({ where: { id } });
  if (!produtoAtual) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  // Nova imagem: envia para o storage. Sem imagem e com "removerImagem": limpa a URL. Caso contrário, mantém a atual.
  let imagemUrl = produtoAtual.imagemUrl;
  if (imagem) {
    imagemUrl = await enviarImagem(imagem, "produtos");
  } else if (removerImagemAtual) {
    imagemUrl = null;
  }

  const produto = await prisma.produtos.update({
    where: { id },
    data: { nome, categoriaId, descricao, preco, descontoPorcentagem, imagemUrl },
    include: { categoria: true },
  });

  // Apaga do storage a imagem antiga que foi substituída ou removida
  if (produtoAtual.imagemUrl !== imagemUrl) {
    await removerImagem(produtoAtual.imagemUrl);
  }

  return NextResponse.json(produto);
}

async function handleUpdate(request: Request, params: Promise<{ id: string }>) {
  try {
    const { id } = await params;
    return await updateProduto(request, id);
  } catch (error) {
    if (error instanceof ErroUpload) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.log(error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}
