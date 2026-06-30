import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '../../../../lib/validations';


export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json(); // request.json() é uma função do next que lê o corpo do Front-end (Formulário)

    const resultado = registerSchema.safeParse(body); // safeParse é uma função do zod que verifica se o body é válido. Ele é safer do que o parse, pois ele retorna um objeto com a propriedade success que indica se o body é válido ou não

    if (!resultado.success){
        const primeiroErro = resultado.error.issues[0].message;
        return NextResponse.json({ error: primeiroErro }, { status: 400 })
    }

    const { name, email, password} = resultado.data; // extrai os dados do body "resultado"

    const usuarioExiste =  await prisma.user.findUnique({ // await é para esperar a resposta do banco de dados. findUnique é uma função do prisma que busca um usuário no banco de dados. where é uma propriedade do prisma que indica onde buscar o usuário. email é a propriedade do usuário que será buscada
        where: { email } // verifica se o email já existe no banco de dados
    });

    // Se o usuário já existir, retorna uma resposta de erro com o status 409 (Conflict)
    if (usuarioExiste){
        return NextResponse.json(
            { error: 'Este e-mail já está cadastrado'}, 
            { status: 409 }
        )
    }

    //Hash da senha
    const hash = await bcrypt.hash(password, 10) // hash é para criptografar a senha. bcrypt.hash é uma função do bcrypt que criptografa a senha. password é a senha que será criptografada. 10 é o número de rounds. A variável hash irá esperar a senha ser criptografada como promessa. O await é para esperar a resposta do banco de dados.


    // Criando o usuário no banco de dados com os dados preenchidos no formulário e a senha criptografada com o Prisma
    const novoUser = await prisma.user.create({
        data:{
            name, 
            email, 
            password: hash
        }
    })
    

    // Retorna uma resposta de sucesso com os dados do novo usuário
    return NextResponse.json({
        message: "Conta criada com sucesso!",
        user: {
            id: novoUser.id,
            name: novoUser.name,
            email: novoUser.email,
        }
    }, { status: 201 });

    // Em caso de erro, retorna uma resposta de erro com a mensagem do erro
  } catch (error: unknown) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json({error:"Algo deu errado. Tente novamente."}, { status: 500 });
  }
}