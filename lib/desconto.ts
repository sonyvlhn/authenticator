// Cálculos de desconto em porcentagem dos produtos.
// Arquivo sem dependências de servidor: pode ser usado tanto nas rotas da API quanto nos componentes do frontend.

export const DESCONTO_MINIMO = 0;
export const DESCONTO_MAXIMO = 100;

// Arredonda para 2 casas decimais (centavos), evitando resultados como 89.99000000000001
function arredondarCentavos(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// Verifica se a porcentagem é um número entre 0 e 100
export function porcentagemValida(porcentagem: number): boolean {
    return Number.isFinite(porcentagem) && porcentagem >= DESCONTO_MINIMO && porcentagem <= DESCONTO_MAXIMO;
}

// Indica se o produto possui desconto aplicado
export function temDesconto(porcentagem: number | null | undefined): boolean {
    return !!porcentagem && porcentagemValida(porcentagem) && porcentagem > 0;
}

// Valor que será abatido do preço. Ex.: preço 200 com 15% => 30
export function calcularValorDesconto(preco: number, porcentagem: number): number {
    if (!temDesconto(porcentagem)) return 0;
    return arredondarCentavos(preco * (porcentagem / 100));
}

// Preço final com o desconto aplicado. Ex.: preço 200 com 15% => 170
// Fórmula: preço - (preço × porcentagem / 100)
export function calcularPrecoComDesconto(preco: number, porcentagem: number): number {
    return arredondarCentavos(preco - calcularValorDesconto(preco, porcentagem));
}
