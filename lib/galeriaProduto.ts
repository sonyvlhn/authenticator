import { prisma } from "@/lib/prisma";
import { enviarImagem, removerImagem, lerArquivos, ErroUpload } from "@/lib/storage";
import { MAX_FOTOS_PRODUTO } from "@/lib/validations";

// Campos do FormData usados pelo modal de produtos:
// - "imagens": arquivos das fotos novas (na ordem em que aparecem no modal)
// - "imagensMantidas": JSON com os ids das fotos já salvas que continuam no produto (somente na edição)
// - "destaque": "existente:<id>" para uma foto já salva ou "nova:<posição>" para uma foto nova

type FotoGaleria = { id?: string; url: string };

export type GaleriaPreparada = {
    fotos: FotoGaleria[]; // fotos finais do produto, na ordem
    imagemUrl: string | null; // URL da foto de destaque
    enviadas: string[]; // URLs enviadas agora ao storage (para desfazer se o banco falhar)
    removidas: FotoGaleria[]; // fotos antigas que saíram do produto
};

// Valida as fotos recebidas, envia as novas ao storage e define qual é a foto de destaque.
// Nada é gravado no banco aqui: isso fica a cargo da rota, dentro de uma transação.
export async function prepararGaleria(formData: FormData, fotosAtuais: { id: string; url: string }[] = []): Promise<GaleriaPreparada> {
    const novas = lerArquivos(formData, "imagens");

    let idsMantidos: string[] = [];
    try {
        const lista: unknown = JSON.parse((formData.get("imagensMantidas") as string) || "[]");
        if (!Array.isArray(lista)) throw new Error();
        idsMantidos = [...new Set(lista.filter((id): id is string => typeof id === "string"))]; // remove repetidos
    } catch {
        throw new ErroUpload("Lista de fotos inválida.");
    }
    const mantidas = fotosAtuais.filter((foto) => idsMantidos.includes(foto.id));
    const removidas = fotosAtuais.filter((foto) => !idsMantidos.includes(foto.id));

    if (mantidas.length + novas.length > MAX_FOTOS_PRODUTO) {
        throw new ErroUpload(`O produto pode ter no máximo ${MAX_FOTOS_PRODUTO} fotos.`);
    }

    // Envia as fotos novas. Se alguma falhar, apaga as que já tinham sido enviadas nesta requisição.
    const enviadas: string[] = [];
    try {
        for (const arquivo of novas) {
            enviadas.push(await enviarImagem(arquivo, "produtos"));
        }
    } catch (error) {
        await Promise.all(enviadas.map((url) => removerImagem(url)));
        throw error;
    }

    // Ordem final: fotos mantidas (na ordem enviada pelo modal) seguidas das novas
    const fotos: FotoGaleria[] = [
        ...idsMantidos.flatMap((id) => mantidas.filter((foto) => foto.id === id).map((foto) => ({ id: foto.id, url: foto.url }))),
        ...enviadas.map((url) => ({ url })),
    ];

    // Foto de destaque escolhida no modal. Se for inválida ou não informada, usa a primeira foto.
    const [tipo, valor] = ((formData.get("destaque") as string) || "").split(":");
    let destaque: string | undefined;
    if (tipo === "existente") destaque = mantidas.find((foto) => foto.id === valor)?.url;
    if (tipo === "nova") destaque = enviadas[Number(valor)];
    const imagemUrl = destaque ?? fotos[0]?.url ?? null;

    return { fotos, imagemUrl, enviadas, removidas };
}

// Grava a galeria do produto: remove as fotos que saíram, atualiza a ordem das mantidas e cria as novas
export function salvarGaleria(produtoId: string, galeria: GaleriaPreparada) {
    return [
        prisma.produtoImagem.deleteMany({ where: { id: { in: galeria.removidas.map((foto) => foto.id!) } } }),
        ...galeria.fotos.map((foto, ordem) =>
            foto.id
                ? prisma.produtoImagem.update({ where: { id: foto.id }, data: { ordem } })
                : prisma.produtoImagem.create({ data: { url: foto.url, ordem, produtoId } })
        ),
    ];
}
