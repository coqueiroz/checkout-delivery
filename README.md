# Checkout de Delivery com Funções de Primeira Classe

Atividade prática da Aula 05: cálculo lambda, funções puras e funções de primeira classe em TypeScript.

O checkout de um aplicativo de delivery calcula o valor final de um pedido aplicando uma sequência de regras de preço: o cupom `PRIMEIRACOMPRA`, a taxa de entrega e o ajuste da forma de pagamento. Cada regra é uma função do mesmo tipo:

```ts
type RegraDePreco = (total: number) => number;
```

## Como executar

É preciso ter o [Node.js](https://nodejs.org) instalado.

```bash
npx tsx exercicio.ts
```

O `tsx` executa o TypeScript direto, sem verificar os tipos. Para checar os tipos:

```bash
npx -p typescript tsc --noEmit exercicio.ts
```

## Restrições

- Sem variáveis globais: todo estado mutável (`let acumulador`) é local à função.
- Sem `class`.
- O código marcado como "pronto, não altere" (`precoDoHappyHour`, `ajusteComSwitch` e os testes em `main`) foi mantido. A única mudança em `main` foi descomentar o teste do vale-refeição, como pede o TODO 9.

## Passo 1: cálculo lambda e funções puras

### TODO 1: a abstração λpreco. preco - 10

```ts
export const descontoDeDez = (preco: number): number => preco - 10;
```

A arrow function é a forma direta de escrever uma abstração lambda: `preco` é a variável ligada e `preco - 10` é o corpo.

### TODO 2: aplicação sem nome

```ts
export const resultadoAplicacao: number = ((preco: number): number => preco - 10)(35);
```

A função é escrita entre parênteses e aplicada na hora a `35`, sem nome nenhum. A redução beta substitui a variável ligada pelo argumento:

```
(λpreco. preco - 10) 35
→β  [preco := 35] (preco - 10)
=   35 - 10
=   25
```

### TODO 3: soma recursiva

```ts
export function somarItens(itens: readonly number[]): number {
  return itens.length === 0 ? 0 : itens[0] + somarItens(itens.slice(1));
}
```

- **Caso base:** a lista vazia soma `0`.
- **Passo recursivo:** o primeiro item somado à soma do resto.

O `slice(1)` cria uma lista nova e não mexe na original, por isso a função continua pura. O parâmetro `readonly number[]` faz o compilador recusar `splice`, `push` e qualquer outro método que altere a lista.

```
somarItens([30, 25])
= 30 + somarItens([25])
= 30 + (25 + somarItens([]))
= 30 + (25 + 0)
= 55
```

### TODO 4: a versão pura do happy hour

```ts
export function precoDoHappyHourPuro(preco: number, hora: number): number {
  return hora >= 17 && hora < 19 ? preco * 0.8 : preco;
}
```

A regra é a mesma de `precoDoHappyHour`, mas a hora chega por parâmetro em vez de vir do `new Date()`. Ler o relógio virou responsabilidade de quem chama, ou seja, da borda do programa.

## Passo 2: função armazenada em variável

### TODO 5: o cupom de três formas

```ts
export function cupomDeclaracao(total: number): number {
  return Math.max(0, total - 15);
}

export const cupomExpressao = function (total: number): number {
  return Math.max(0, total - 15);
};

export const cupomArrow: RegraDePreco = (total) => Math.max(0, total - 15);
```

O `Math.max(0, ...)` impede que o total fique negativo: `cupomArrow(10)` devolve `0`. As três formas calculam a mesma coisa. A diferença é o *hoisting*: a declaração pode ser usada em qualquer lugar do arquivo, enquanto a expressão e a arrow só existem a partir da linha em que são criadas.

### TODO 6: guardar a função, não o resultado

```ts
export const cupomPrimeiraCompra: RegraDePreco = cupomArrow;
```

Sem parênteses, `cupomArrow` é a própria função, e as duas constantes apontam para o mesmo objeto (`cupomPrimeiraCompra === cupomArrow` é `true`). Com parênteses, `cupomArrow(40)` seria o número `25`.

## Passo 3: função armazenada em objeto

### TODO 7: a tabela de funções

```ts
export const ajustePorPagamento: Record<FormaPagamento, RegraDePreco> = {
  pix: (total) => total * 0.95,
  debito: (total) => total,
  credito: (total) => total * 1.04,
  valeRefeicao: (total) => total,
};
```

O `switch` do código legado virou dado: cada chave do objeto aponta para a regra da sua forma de pagamento.

### TODO 8: consulta sem `if` nem `switch`

```ts
export function totalComPagamento(total: number, forma: FormaPagamento): number {
  return ajustePorPagamento[forma](total);
}
```

`ajustePorPagamento[forma]` devolve a função, e o `(total)` logo depois a executa.

### TODO 9: incluir o vale-refeição

Primeiro, **só** o tipo foi alterado:

```ts
export type FormaPagamento = "pix" | "debito" | "credito" | "valeRefeicao";
```

Resultado do `tsc --noEmit` nesse momento:

```
exercicio.ts(105,14): error TS2741: Property 'valeRefeicao' is missing in type
'{ pix: ...; debito: ...; credito: ...; }' but required in type
'Record<FormaPagamento, RegraDePreco>'.
```

| Implementação | O que aconteceu |
|---|---|
| `ajusteComSwitch` | Compilou sem nenhum aviso. O `"valeRefeicao"` cai no `default` e é tratado em silêncio como "sem ajuste". |
| `ajustePorPagamento` | Erro de compilação. O `Record` exige uma regra para cada forma de pagamento do tipo. |

O `tsx`, que não verifica tipos, continuou rodando normalmente. Por isso o erro só aparece no editor ou no `tsc`.

Depois disso, a regra `valeRefeicao: (total) => total` entrou na tabela e o teste correspondente em `main` foi descomentado.

## Passo 4: função armazenada em array

### TODO 10: as regras do pedido

```ts
export const regrasDoPedido: readonly RegraDePreco[] = [
  cupomPrimeiraCompra,
  (total) => (total >= 50 ? total : total + 7),
  ajustePorPagamento.pix,
];
```

O array guarda três funções: uma referência a uma constante, uma arrow escrita no próprio array e uma função tirada da tabela de pagamentos (`ajustePorPagamento.pix`, sem parênteses).

### TODO 11: aplicar em sequência

```ts
export function aplicarEmSequencia(total: number): number {
  let acumulador = total;
  for (const regra of regrasDoPedido) {
    acumulador = regra(acumulador);
  }
  return acumulador;
}
```

A saída de cada regra é a entrada da próxima, e a ordem importa:

```
 60 --cupom--> 45 --entrega (+7)--> 52 --Pix--> 49.4
100 --cupom--> 85 --entrega (isenta)--> 85 --Pix--> 80.75
```

Com 60, o desconto do cupom deixa o total abaixo de 50 e a entrega passa a ser cobrada. Se a taxa viesse antes do cupom, o pedido seria isento.

## Passo 5: função passada como parâmetro

### TODO 12: as regras como parâmetro

```ts
export function aplicarRegras(total: number, regras: readonly RegraDePreco[]): number {
  let acumulador = total;
  for (const regra of regras) {
    acumulador = regra(acumulador);
  }
  return acumulador;
}
```

É a mesma lógica do TODO 11, mas quem chama decide quais regras aplicar.

### TODO 13: fechar o pedido

```ts
export function fecharPedido(itens: readonly number[], regra: RegraDePreco): number {
  return regra(somarItens(itens));
}
```

`fecharPedido` não sabe qual regra está aplicando. Nos testes ela recebe:

| Regra passada | Cálculo | Resultado |
|---|---|---|
| `cupomPrimeiraCompra` | 55 − 15 | 40 |
| `ajustePorPagamento.credito` | 55 × 1,04 | 57.2 |
| `(total) => total` | 55 | 55 |
| `aplicarEmSequencia` | 55 → 40 → 47 → 44,65 | 44.65 |
| arrow com `aplicarRegras(total, [cupom, crédito])` | 55 → 40 → 41,6 | 41.6 |

## Saída do programa

```
--- Passo 1: cálculo lambda e funções puras ---
25
25
55
40
0
32
40
40          <- depende da hora em que o programa roda

--- Passo 2: função em variável ---
25
25
25
0
true
function

--- Passo 3: função em objeto ---
95
100
104
100

--- Passo 4: função em array ---
3
49.4
80.75

--- Passo 5: função como parâmetro ---
49.4
40
57.2
55
44.65
41.6
```

## Respostas das perguntas

As respostas completas estão em comentário no final do [`exercicio.ts`](exercicio.ts). Em resumo:

1. `formatarPreco` é **pura**. `registrarPedido` é **impura** porque escreve no console (efeito externo). `gerarCodigoRastreio` é **impura** porque devolve uma saída diferente a cada chamada (`Math.random`). Nos dois casos impuros, a correção é a mesma: o efeito (o console ou o sorteio) vai para a borda e o valor entra ou sai por parâmetro.
2. `precoDoHappyHourPuro` recebe a hora como parâmetro, então o teste escolhe a hora. `precoDoHappyHour` lê o relógio por dentro, e para testá-la seria preciso um mock do `Date`.
3. O `switch` aceitou o novo valor em silêncio, pelo `default`. A tabela com `Record` deu erro de compilação e protegeu o sistema.
4. A primeira chamada passa a função. A segunda passa o número `40` e dá `TS2345: Argument of type 'number' is not assignable to parameter of type 'RegraDePreco'`.

## Autor

Lucas Coqueiro
