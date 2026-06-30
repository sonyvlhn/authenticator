import { NextResponse, type NextRequest } from "next/server";
import { validarToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value; // A constante token está pegando o valor do cookie "token" que foi definido no login

    const payload = token ? await validarToken(token) : null; // Aqui a constanta payload está validando com a função validarToken do arquivo lib/auth.ts se o token requisitado com o cookie da constante anterior (token)

    //Aqui está verificando se o usuário está logado com cookies validos, caso contrário, ele será redirecionado para a tela de login "/login"
    if(!payload){
        const urlLogin = new URL("/login", request.url);
        return NextResponse.redirect(urlLogin);
    }
    return NextResponse.next(); // NextResponse.next() é para permitir que a requisição continue
}

export const config = {
    matcher: ['/protected/:path*'],
}