import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function updateProduto(request: Request, id: string) {
  const formData = await request.formData();
  const nome = formData.get("nome") as string;
  const categoriaId = formData.get("categoriaId") as string;
  const descricao = formData.get("descricao") as string;
  const preco = parseFloat(formData.get("preco") as string);

  const produto = await prisma.produtos.update({
    where: { id },
    data: { nome, categoriaId, descricao, preco },
    include: { categoria: true },
  });

  return NextResponse.json(produto);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await updateProduto(request, id);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await updateProduto(request, id);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}
