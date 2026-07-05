import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: { _count: { select: { produtos: true } } },
    });

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    return NextResponse.json(categoria);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao buscar categoria" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nome, descricao } = await request.json();

    const categoriaAtual = await prisma.categoria.findUnique({
      where: { id },
      include: { _count: { select: { produtos: true } } },
    });

    if (!categoriaAtual) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    const temProdutosVinculados = categoriaAtual._count.produtos > 0;

    if (temProdutosVinculados && nome !== undefined && nome !== categoriaAtual.nome) {
      return NextResponse.json(
        { error: "Não é possível alterar o nome de uma categoria vinculada a produtos" },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        ...(!temProdutosVinculados && nome !== undefined ? { nome } : {}),
        ...(descricao !== undefined ? { descricao: descricao || null } : {}),
      },
    });

    return NextResponse.json(categoria);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: { _count: { select: { produtos: true } } },
    });

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    if (categoria._count.produtos > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir uma categoria vinculada a produtos" },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 });
  }
}
