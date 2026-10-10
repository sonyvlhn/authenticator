import { z } from 'zod';
import { porcentagemValida } from './desconto';

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

// Converte campos vazios do formulário (FormData) em "undefined", para que o zod mostre a mensagem de campo obrigatório
const vazioParaUndefined = (valor: unknown) => (valor === '' || valor === null ? undefined : valor);

export const produtoSchema = z.object({ // valida os dados do formulário de produtos (cadastro e edição)
  nome: z.string({ message: 'Informe o nome do produto.' }).trim().min(1, { message: 'Informe o nome do produto.' }),
  categoriaId: z.string({ message: 'Selecione uma categoria.' }).min(1, { message: 'Selecione uma categoria.' }),
  descricao: z.string().trim().default(''),
  preco: z.preprocess(vazioParaUndefined, z.coerce.number({ message: 'Informe um preço válido.' }).positive({ message: 'O preço deve ser maior que zero.' })),
  descontoPorcentagem: z.preprocess((valor) => vazioParaUndefined(valor) ?? 0, // sem desconto informado = 0%
    z.coerce.number({ message: 'Informe um desconto válido.' }).refine(porcentagemValida, { message: 'O desconto deve ser uma porcentagem entre 0 e 100.' })),
});

export type produtoInput = z.infer<typeof produtoSchema>

// Lê e valida os campos de texto do FormData de produtos
export function validarProduto(formData: FormData) {
  return produtoSchema.safeParse({
    nome: formData.get('nome') ?? undefined,
    categoriaId: formData.get('categoriaId') ?? undefined,
    descricao: formData.get('descricao') ?? undefined,
    preco: formData.get('preco'),
    descontoPorcentagem: formData.get('descontoPorcentagem'),
  });
}
