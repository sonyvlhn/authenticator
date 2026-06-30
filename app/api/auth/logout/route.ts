import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
    const resposta = NextResponse.json({
      message: "Logout realizado com sucesso!"  
    }, {status: 200});

    //Removendo cookie para deslogar o usuário
    resposta.cookies.set("token", "", {
        httpOnly: true, // O cookie não pode ser acessado pelo JavaScript do Front-end
        secure: process.env.NODE_ENV === "production", // O cookie só será enviado em conexões seguras (HTTPS)
        sameSite: "lax", // O cookie não será enviado em requisições cross-site
        maxAge: 0, // Deixa o token expirado para não ser mais válido
        path: "/", // O cookie será removido de todo o domínio
    });
    return resposta;
}