import { z } from 'zod';

export const registerSchema = z.object({ // define a estrutura do objeto registerSchema
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }), // define que o campo name é do tipo string e deve ter pelo menos 3 caracteres
  email: z.string().email({ message: 'Digite um E-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }).regex(/[A-Z]/, { message: 'A senha deve ter pelo menos uma letra maiúscula.' }).regex(/[a-z]/, { message: 'A senha deve ter pelo menos uma letra minúscula.' }).regex(/[0-9]/, { message: 'A senha deve ter pelo menos um número.' }).regex(/[@$!%*?&]/, { message: 'A senha deve ter pelo menos um caractere especial.' }),
});


//exportando a constante "registerSchema" para ser usado em outros arquivos
export const loginSchema = z.object({ // define a estrutura do objeto loginSchema
  email: z.string().email({ message: 'Digite um E-mail inválido.' }), // define que o campo email é do tipo string e valida se o texto possui o formato oficial de um e-mail (ex: usuario@dominio.com)
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }), // define que o campo password é do tipo string e deve ter pelo menos 6 caracteres
});

export type registerInput = z.infer<typeof registerSchema> // tipagem que já vem do z

export type loginInput = z.infer<typeof loginSchema> // tipagem que já vem do z