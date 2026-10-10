import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarImagem, lerArquivo, ErroUpload } from "@/lib/storage";
import { porcentagemValida } from "@/lib/desconto";



// Aqui montamos a chamada GET para buscar os produtos
// Isso vai rodar automaticamente quando entrarmos na rota /api/produtos
// Onde teremos a lista de todos os produtos
// O include serve para trazer a categoria junto com o produto
// O orderBy serve para ordenar os produtos por nome em ordem crescente
// O catch serve para tratar os erros   
export async function GET() {
   try {
        const produtos = await prisma.produtos.findMany({
            include: { categoria: true},
            orderBy: {nome: 'asc'}
        })
        return NextResponse.json(produtos)
   } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
   }
}
    // A função 
export async function POST(request: Request) {
   try {
    const formData = await request.formData() // lendo o FormData (multipart) que vem do front-end
    const nome = formData.get('nome') as string
    const categoriaId = formData.get('categoriaId') as string
    const descricao = formData.get('descricao') as string
    const preco = parseFloat(formData.get('preco') as string)
    const descontoPorcentagem = parseFloat((formData.get('descontoPorcentagem') as string) || '0') // sem desconto informado = 0%
    if (!porcentagemValida(descontoPorcentagem)) {
        return NextResponse.json({ error: 'O desconto deve ser uma porcentagem entre 0 e 100' }, { status: 400 })
    }
    const imagem = lerArquivo(formData, 'imageFile')

    // envia a imagem para o container de storage e guarda a URL pública gerada
    const imagemUrl = imagem ? await enviarImagem(imagem, 'produtos') : null

    const produto = await prisma.produtos.create({
        data: { nome, categoriaId, preco, descontoPorcentagem, descricao, imagemUrl }
    }) // criando o produto no banco de dados

    return NextResponse.json(produto) // retornando o produto criado
   } catch (error) {
    if (error instanceof ErroUpload) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.log(error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
   }
}