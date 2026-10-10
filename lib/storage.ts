import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { obterVariavel } from "./env";

// Configurações do container de imagens (SeaweedFS / S3), definidas no .env.
// São lidas no primeiro uso, para que a falta de uma variável gere um erro claro em vez de credenciais vazias.
let configuracao: { s3: S3Client; bucket: string; urlPublica: string } | null = null;

function obterConfiguracao() {
    if (!configuracao) {
        configuracao = {
            bucket: obterVariavel("STORAGE_BUCKET"),
            urlPublica: obterVariavel("NEXT_PUBLIC_STORAGE_URL").replace(/\/$/, ""), // ex.: http://localhost:8333/imagens
            s3: new S3Client({
                endpoint: obterVariavel("STORAGE_ENDPOINT"), // ex.: http://localhost:8333
                region: "us-east-1", // o SeaweedFS ignora a região, mas o SDK exige uma
                forcePathStyle: true, // URLs no formato http://host/bucket/arquivo (em vez de http://bucket.host/arquivo)
                credentials: {
                    accessKeyId: obterVariavel("STORAGE_ACCESS_KEY"),
                    secretAccessKey: obterVariavel("STORAGE_SECRET_KEY"),
                },
            }),
        };
    }
    return configuracao;
}

const TIPOS_PERMITIDOS: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
};
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

// Erro de validação do arquivo enviado (vira status 400 nas rotas)
export class ErroUpload extends Error {}

// Envia a imagem para o storage e retorna a URL pública que será salva no banco
export async function enviarImagem(arquivo: File, pasta: string): Promise<string> {
    const extensao = TIPOS_PERMITIDOS[arquivo.type];
    if (!extensao) {
        throw new ErroUpload("Formato de imagem inválido. Use PNG, JPG, WEBP ou GIF.");
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
        throw new ErroUpload("A imagem deve ter no máximo 5 MB.");
    }

    const { s3, bucket, urlPublica } = obterConfiguracao();
    const chave = `${pasta}/${randomUUID()}.${extensao}`;
    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: chave,
        Body: Buffer.from(await arquivo.arrayBuffer()),
        ContentType: arquivo.type,
    }));

    return `${urlPublica}/${chave}`;
}

// Remove do storage uma imagem salva anteriormente (ignora URLs que não pertencem ao storage)
export async function removerImagem(url: string | null | undefined): Promise<void> {
    const { s3, bucket, urlPublica } = obterConfiguracao();
    if (!url || !url.startsWith(`${urlPublica}/`)) return;

    try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: url.slice(urlPublica.length + 1) }));
    } catch (error) {
        console.log("Erro ao remover imagem do storage:", error);
    }
}

// Lê o arquivo de imagem de um FormData (retorna null se nenhum arquivo foi enviado)
export function lerArquivo(formData: FormData, campo: string): File | null {
    const arquivo = formData.get(campo);
    return arquivo instanceof File && arquivo.size > 0 ? arquivo : null;
}
