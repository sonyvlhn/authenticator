import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obterAdminLogado } from "@/lib/sessao";

export async function GET() {
  if (!(await obterAdminLogado())) {
    return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 });
  }

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
