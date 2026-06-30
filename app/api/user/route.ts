import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const token =  request.cookies.get("token")?.value; //Declara o valor da requisição GET, acessando o cookie chamado "token" na constante "token".

    if(!token) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401}); //Se o "token"(cookie) não existir, retorna uma mensagem de erro com status 401

    }
    const {payload} = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)); //Verifica o "token" (jwt) e decodifica ele para que seja possível acessar as informações do usuário
    
    const usuario = payload.name

    return NextResponse.json({name: usuario}) //o 'name' é um genérico/tipo da chave que está sendo acessada. Para que essa chave seja encontrada, é necessário que ela exista no objeto/tipos genéricos.
}