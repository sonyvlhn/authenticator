// Lê uma variável de ambiente obrigatória. Se ela não existir, o servidor falha com uma mensagem clara
// em vez de seguir com um valor vazio ou "undefined" (ex.: tokens JWT assinados com a chave "undefined").
export function obterVariavel(nome: string): string {
    const valor = process.env[nome];
    if (!valor) {
        throw new Error(`Variável de ambiente ${nome} não definida. Confira o arquivo .env (veja .env.example).`);
    }
    return valor;
}

// Chave usada para assinar e validar os tokens JWT (mínimo de 32 caracteres)
export function obterJwtSecret(): Uint8Array {
    const secret = obterVariavel("JWT_SECRET");
    if (secret.length < 32) {
        throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres. Gere um valor com: openssl rand -base64 48");
    }
    return new TextEncoder().encode(secret);
}
