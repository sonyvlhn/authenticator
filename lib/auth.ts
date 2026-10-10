import { SignJWT, jwtVerify } from "jose";
import { obterJwtSecret } from "./env";

export type TokenPayload = {
    id: string;
    email: string;
    name?: string;
};

export async function criarToken (payload: TokenPayload): Promise<string>{
    return await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'}) // Define o algoritmo de assinatura do token. O "HS256" é um algoritmo de assinatura simétrica.
    .setIssuedAt() // Define a data de emissão do token como o momento atual (em segundos, conforme esperado pelo padrão JWT).
    .setExpirationTime('4h') // Define o tempo de expiração do token.
    .sign(obterJwtSecret()) // Assina o token com a chave secreta. O "obterJwtSecret()" é a chave secreta que será usada para assinar o token.
}

//Validando JWT
export async function validarToken(token: string): Promise<TokenPayload | null> { // "Promise<TokenPayload> | null" significa que a função pode retornar um objeto/Tipos GENÉRICO do tipo "TokenPayload" ou "null" (nulo) caso "token" seja inválido, já que "token" é uma string que será validada pelo "jwtVerify" com a chave secreta
    try{
        const {payload} = await jwtVerify(token, obterJwtSecret())
        return payload as TokenPayload // "payload as TokenPayload" é uma conversão de tipo, que indica que o "payload" é do tipo "TokenPayload"
    } catch{
        return null; // "return null" é para retornar "null" (nulo) caso "token" seja inválido
    }
}
