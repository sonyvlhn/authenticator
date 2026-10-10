import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const token =  request.cookies.get("token")?.value; //Declara o valor da requisição GET, acessando o cookie chamado "token" na constante "token".

    //Valida o "token" (jwt) com a mesma função usada no restante do projeto. Se ele não existir, for inválido ou estiver expirado, retorna 401
    const payload = token ? await validarToken(token) : null;
    if(!payload) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    return NextResponse.json({name: payload.name}) //o 'name' é um genérico/tipo da chave que está sendo acessada. Para que essa chave seja encontrada, é necessário que ela exista no objeto/tipos genéricos.
}
