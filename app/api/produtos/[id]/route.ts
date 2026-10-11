import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { removerImagem, ErroUpload } from "@/lib/storage";
import { prepararGaleria, salvarGaleria } from "@/lib/galeriaProduto";
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

  const produtoAtual = await prisma.produtos.findUnique({ where: { id }, include: { imagens: true } });
  if (!produtoAtual) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  // Envia as fotos novas, separa as que foram mantidas/removidas e define a foto de destaque
  const galeria = await prepararGaleria(formData, produtoAtual.imagens);

  let produto;
  try {
    const resultados = await prisma.$transaction([
      ...salvarGaleria(id, galeria),
      prisma.produtos.update({
        where: { id },
        data: { nome, categoriaId, descricao, preco, descontoPorcentagem, imagemUrl: galeria.imagemUrl },
        include: { categoria: true, imagens: { orderBy: { ordem: "asc" } } },
      }),
    ]);
    produto = resultados[resultados.length - 1];
  } catch (error) {
    await Promise.all(galeria.enviadas.map((url) => removerImagem(url))); // se o banco falhar, apaga as fotos novas que acabaram de ser enviadas
    throw error;
  }

  // Só depois de gravar no banco apaga do storage as fotos que foram removidas do produto
  await Promise.all(galeria.removidas.map((foto) => removerImagem(foto.url)));

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
