import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nome, descricao } = await request.json();

    const categoria = await prisma.categoria.create({
      data: { nome, descricao: descricao || null },
    });

    return NextResponse.json(categoria);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 });
  }
}
