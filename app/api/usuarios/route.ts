import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const usuarios = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        acessoLiberado: true,
        tipoAcesso: true,
        createdAt: true,
      },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}
