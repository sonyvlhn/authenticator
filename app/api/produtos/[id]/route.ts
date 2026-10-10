import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarImagem, removerImagem, lerArquivo, ErroUpload } from "@/lib/storage";
import { validarProduto } from "@/lib/validations";

async function updateProduto(request: Request, id: string) {
  const formData = await request.formData();

  // valida os campos antes de enviar a imagem ou gravar no banco
  const resultado = validarProduto(formData);
  if (!resultado.success) {
    return NextResponse.json({ error: resultado.error.issues[0].message }, { status: 400 });
  }
  const { nome, categoriaId, descricao, preco, descontoPorcentagem } = resultado.data;

  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 400 });
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

  let produto;
  try {
    produto = await prisma.produtos.update({
      where: { id },
      data: { nome, categoriaId, descricao, preco, descontoPorcentagem, imagemUrl },
      include: { categoria: true },
    });
  } catch (error) {
    if (imagem) await removerImagem(imagemUrl); // se o banco falhar, apaga a imagem nova que acabou de ser enviada
    throw error;
  }

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
