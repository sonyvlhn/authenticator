import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { criarToken } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try{
       const body = await request.json();
       
       const resultado = loginSchema.safeParse(body)
       if(!resultado.success){
        const primeiroErro = resultado.error.issues[0].message;
        return NextResponse.json({error: primeiroErro}, {status: 400});
       }

       const {email, password} = resultado.data;
       
       //Procura o usuário no banco de dados com o email e traz consigo a senha criptografada (hash)
       const usuario = await prisma.user.findUnique({ where: {email}});

       //Valida a senha com o hash armazenado
       const validarSenha: boolean = usuario ? await bcrypt.compare(password, usuario.password) : false;

       //Se o usuário não existir ou a senha for inválida, retorna uma mensagem de erro
       if(!usuario || !validarSenha){
            return NextResponse.json(
                {error: "Email ou senha inválidos."},
                {status: 401});
       }

       if(!usuario.acessoLiberado){
            return NextResponse.json(
                {error: "Seu acesso ainda não foi liberado pelo administrador."},
                {status: 403});
       }

       const token = await criarToken({
        id: usuario.id,
        email: usuario.email,
        name: usuario.name
       })
       
       const resposta = NextResponse.json({
        message: "Login realizado com sucesso!",
        user: {
            id: usuario.id,
            name: usuario.name,
            email: usuario.email
        }
       });

       resposta.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 4, // 60 segundos * 60 minutos * 4 horas. Esse é o tempo que o cookie ficará armazenado no navegador. Totalizando 14400 segundos.
        path: "/",
       });
       return resposta;
    } catch(error: unknown){
        console.error("Erro no login:", error);
        return NextResponse.json(
            {error: "Algo deu errado. Tente novamente."}, 
            {status: 500});
    }
}