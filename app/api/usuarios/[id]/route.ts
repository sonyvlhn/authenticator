import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoAcesso } from "@/app/generated/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        acessoLiberado: true,
        tipoAcesso: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, email, acessoLiberado, tipoAcesso } = await request.json();

    if (tipoAcesso !== undefined && !Object.values(TipoAcesso).includes(tipoAcesso)) {
      return NextResponse.json({ error: "Tipo de acesso inválido" }, { status: 400 });
    }

    const usuarioAtual = await prisma.user.findUnique({ where: { id } });
    if (!usuarioAtual) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (email !== undefined && email !== usuarioAtual.email) {
      const emailEmUso = await prisma.user.findUnique({ where: { email } });
      if (emailEmUso) {
        return NextResponse.json({ error: "Este e-mail já está em uso" }, { status: 409 });
      }
    }

    const usuario = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(acessoLiberado !== undefined ? { acessoLiberado } : {}),
        ...(tipoAcesso !== undefined ? { tipoAcesso } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        acessoLiberado: true,
        tipoAcesso: true,
        createdAt: true,
      },
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const usuario = await prisma.user.findUnique({ where: { id } });
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}
