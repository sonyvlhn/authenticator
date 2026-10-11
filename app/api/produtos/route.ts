import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { removerImagem, ErroUpload } from "@/lib/storage";
import { prepararGaleria } from "@/lib/galeriaProduto";
import { validarProduto } from "@/lib/validations";



// Aqui montamos a chamada GET para buscar os produtos
// Isso vai rodar automaticamente quando entrarmos na rota /api/produtos
// Onde teremos a lista de todos os produtos
// O include serve para trazer a categoria junto com o produto
// O orderBy serve para ordenar os produtos por nome em ordem crescente
// O catch serve para tratar os erros   
export async function GET() {
   try {
        const produtos = await prisma.produtos.findMany({
            include: { categoria: true, imagens: { orderBy: { ordem: 'asc' } } },
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

    // valida os campos antes de enviar a imagem ou gravar no banco
    const resultado = validarProduto(formData)
    if (!resultado.success) {
        return NextResponse.json({ error: resultado.error.issues[0].message }, { status: 400 })
    }
    const { nome, categoriaId, descricao, preco, descontoPorcentagem } = resultado.data

    const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } })
    if (!categoria) {
        return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 400 })
    }

    // envia as fotos (até 5) para o container de storage e define a foto de destaque
    const galeria = await prepararGaleria(formData)

    let produto
    try {
        produto = await prisma.produtos.create({
            data: {
                nome, categoriaId, preco, descontoPorcentagem, descricao,
                imagemUrl: galeria.imagemUrl, // foto de destaque, usada no card
                imagens: { create: galeria.fotos.map((foto, ordem) => ({ url: foto.url, ordem })) },
            },
            include: { imagens: { orderBy: { ordem: 'asc' } } },
        }) // criando o produto e suas fotos no banco de dados
    } catch (error) {
        await Promise.all(galeria.enviadas.map((url) => removerImagem(url))) // se o banco falhar, não deixa fotos órfãs no storage
        throw error
    }

    return NextResponse.json(produto) // retornando o produto criado
   } catch (error) {
    if (error instanceof ErroUpload) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.log(error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
   }
}