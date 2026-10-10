import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validarToken } from "@/lib/auth";
import { TipoAcesso } from "@/app/generated/prisma/client";

export type UsuarioSessao = {
    id: string;
    name: string;
    email: string;
    tipoAcesso: TipoAcesso;
};

// Retorna o usuário logado somente se o token for válido E o acesso estiver liberado pelo admin.
// A consulta ao banco garante que, se o admin bloquear o usuário, o bloqueio vale na hora (mesmo com o cookie ainda válido).
export async function obterUsuarioLogado(): Promise<UsuarioSessao | null> {
    const token = (await cookies()).get("token")?.value;
    const payload = token ? await validarToken(token) : null;
    if (!payload) return null;

    const usuario = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, name: true, email: true, tipoAcesso: true, acessoLiberado: true },
    });

    if (!usuario || !usuario.acessoLiberado) return null;

    return { id: usuario.id, name: usuario.name, email: usuario.email, tipoAcesso: usuario.tipoAcesso };
}

// Retorna o usuário logado somente se ele for ADMIN
export async function obterAdminLogado(): Promise<UsuarioSessao | null> {
    const usuario = await obterUsuarioLogado();
    return usuario?.tipoAcesso === TipoAcesso.ADMIN ? usuario : null;
}
