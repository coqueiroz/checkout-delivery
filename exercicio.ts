// ==============================================================================
// ATIVIDADE PRÁTICA — AULA 05: CÁLCULO LAMBDA, FUNÇÕES PURAS E PRIMEIRA CLASSE
// ==============================================================================
// As instruções completas estão no arquivo 'enunciado_exercicio.txt'.
//
// PASSO 1: Cálculo lambda e funções puras
// PASSO 2: Função armazenada em variável
// PASSO 3: Função armazenada em objeto
// PASSO 4: Função armazenada em array
// PASSO 5: Função passada como parâmetro
//
// Execução:  npx tsx exercicio.ts
// ==============================================================================

// Uma regra de preço recebe o total e devolve o total ajustado.
export type RegraDePreco = (total: number) => number;

// ------------------------------------------------------------------------------
// PASSO 1: Cálculo lambda e funções puras
// ------------------------------------------------------------------------------

// TODO 1: Escreva em TypeScript a abstração  λpreco. preco - 10
// Sugestão: arrow function  (preco: number): number => ...
export const descontoDeDez = (preco: number): number => preco - 10;

// TODO 2: Aplique a MESMA abstração diretamente ao valor 35, sem utilizar o
// nome descontoDeDez. Em comentário logo abaixo, escreva a redução beta passo
// a passo.
// Sugestão: arrow entre parênteses, chamada imediatamente:
//   ((preco: number) => ...)(35)
export const resultadoAplicacao: number = ((preco: number): number => preco - 10)(35);
// Redução beta:
//   (λpreco. preco - 10) 35
//   →β  [preco := 35] (preco - 10)
//   =   35 - 10
//   =   25

// TODO 3: Some os preços dos itens SEM for, while ou reduce: utilize recursão.
// Lista vazia soma 0; caso contrário, o primeiro item somado à soma dos demais.
// Sugestão: itens.length === 0 (caso base), itens[0] (primeiro item) e
// itens.slice(1) (NOVA lista sem o primeiro item). Não utilize splice: ele
// altera a lista original e torna a função impura.
export function somarItens(itens: readonly number[]): number {
  return itens.length === 0 ? 0 : itens[0] + somarItens(itens.slice(1));
}

// Função IMPURA (pronta, não altere): 20% de desconto entre 17h e 19h.
export function precoDoHappyHour(preco: number): number {
  const hora = new Date().getHours();
  return hora >= 17 && hora < 19 ? preco * 0.8 : preco;
}

// TODO 4: Escreva a versão PURA de precoDoHappyHour: mesma regra, mas a hora
// é recebida por parâmetro em vez de ser lida do relógio.
// Sugestão: operador ternário com a condição  hora >= 17 && hora < 19;
// 20% de desconto equivale a  preco * 0.8.
export function precoDoHappyHourPuro(preco: number, hora: number): number {
  return hora >= 17 && hora < 19 ? preco * 0.8 : preco;
}

// ------------------------------------------------------------------------------
// PASSO 2: Função armazenada em variável
// ------------------------------------------------------------------------------

// TODO 5: Escreva o cupom PRIMEIRACOMPRA (R$ 15 de desconto, sem que o total
// fique negativo) de três formas: declaração, expressão e arrow.
// Sugestão: Math.max(0, total - 15).
export function cupomDeclaracao(total: number): number {
  return Math.max(0, total - 15);
}

export const cupomExpressao = function (total: number): number {
  return Math.max(0, total - 15);
};

export const cupomArrow: RegraDePreco = (total) => Math.max(0, total - 15);

// TODO 6: Armazene em cupomPrimeiraCompra a MESMA função de cupomArrow.
// Atenção: deve ser armazenada a função, e não o resultado de sua chamada.
// Sugestão: atribuição direta, sem parênteses após o nome da função.
export const cupomPrimeiraCompra: RegraDePreco = cupomArrow;

// ------------------------------------------------------------------------------
// PASSO 3: Função armazenada em objeto
// ------------------------------------------------------------------------------

export type FormaPagamento = "pix" | "debito" | "credito" | "valeRefeicao";

// Código legado (pronto, não altere).
export function ajusteComSwitch(forma: FormaPagamento, total: number): number {
  switch (forma) {
    case "pix":
      return total * 0.95;
    case "credito":
      return total * 1.04;
    default:
      return total;
  }
}

// TODO 7: Substitua o switch por uma tabela de funções: cada forma de
// pagamento referencia a sua regra. Pix: 5% de desconto; débito: sem
// alteração; crédito: 4% de acréscimo.
// Sugestão: total * 0.95 (Pix) e total * 1.04 (crédito).
export const ajustePorPagamento: Record<FormaPagamento, RegraDePreco> = {
  pix: (total) => total * 0.95,
  debito: (total) => total,
  credito: (total) => total * 1.04,
  valeRefeicao: (total) => total,
};

// TODO 8: Obtenha a regra da forma de pagamento na tabela e aplique-a ao
// total, sem utilizar if ou switch.
// Sugestão: ajustePorPagamento[forma] devolve a função; chame-a com (total).
export function totalComPagamento(total: number, forma: FormaPagamento): number {
  return ajustePorPagamento[forma](total);
}

// TODO 9: Acrescente "valeRefeicao" ao tipo FormaPagamento. Antes de qualquer
// outra alteração, observe no editor (ou com 'npx -p typescript tsc --noEmit
// exercicio.ts') o comportamento de ajusteComSwitch e de ajustePorPagamento.
// Em seguida, inclua a regra do vale-refeição na tabela (sem ajuste) e remova
// o comentário do teste correspondente na função main.

// ------------------------------------------------------------------------------
// PASSO 4: Função armazenada em array
// ------------------------------------------------------------------------------

// TODO 10: Monte a lista de regras do pedido, NESTA ordem:
//   1. o cupom PRIMEIRACOMPRA (utilize cupomPrimeiraCompra);
//   2. a taxa de entrega, escrita no próprio array como arrow: isenta quando o
//      total for igual ou superior a 50; caso contrário, acrescenta 7;
//   3. o desconto do Pix (obtenha a função a partir de ajustePorPagamento).
// Sugestão: ternário  total >= 50 ? ... : ...  para a entrega;
// ajustePorPagamento.pix, sem parênteses, para o Pix.
export const regrasDoPedido: readonly RegraDePreco[] = [
  cupomPrimeiraCompra,
  (total) => (total >= 50 ? total : total + 7),
  ajustePorPagamento.pix,
];

// TODO 11: Aplique as regras de regrasDoPedido, uma após a outra, ao total.
// Sugestão: acumulador local com let, iniciado com o total, e
//   for (const regra of regrasDoPedido) { acumulador = regra(acumulador); }
export function aplicarEmSequencia(total: number): number {
  let acumulador = total;
  for (const regra of regrasDoPedido) {
    acumulador = regra(acumulador);
  }
  return acumulador;
}

// ------------------------------------------------------------------------------
// PASSO 5: Função passada como parâmetro
// ------------------------------------------------------------------------------

// TODO 12: Equivalente a aplicarEmSequencia, porém a lista de regras é recebida
// por parâmetro.
// Sugestão: a mesma estrutura do TODO 11, percorrendo 'regras'.
export function aplicarRegras(total: number, regras: readonly RegraDePreco[]): number {
  let acumulador = total;
  for (const regra of regras) {
    acumulador = regra(acumulador);
  }
  return acumulador;
}

// TODO 13: Some os itens e aplique ao resultado a regra recebida.
// fecharPedido não define a regra; essa decisão cabe a quem a chama.
// Sugestão: regra(somarItens(itens)).
export function fecharPedido(itens: readonly number[], regra: RegraDePreco): number {
  return regra(somarItens(itens));
}

// ------------------------------------------------------------------------------
// TESTES — rode e compare com os comentários
// ------------------------------------------------------------------------------
function main(): void {
  console.log("--- Passo 1: cálculo lambda e funções puras ---");
  console.log(descontoDeDez(35));                  // 25
  console.log(resultadoAplicacao);                 // 25
  console.log(somarItens([30, 25]));               // 55
  console.log(somarItens([12.5, 7.5, 20]));        // 40
  console.log(somarItens([]));                     // 0
  console.log(precoDoHappyHourPuro(40, 18));       // 32
  console.log(precoDoHappyHourPuro(40, 21));       // 40
  console.log(precoDoHappyHourPuro(40, new Date().getHours())); // depende da hora

  console.log("\n--- Passo 2: função em variável ---");
  console.log(cupomDeclaracao(40));                // 25
  console.log(cupomExpressao(40));                 // 25
  console.log(cupomArrow(40));                     // 25
  console.log(cupomArrow(10));                     // 0
  console.log(cupomPrimeiraCompra === cupomArrow); // true
  console.log(typeof cupomPrimeiraCompra);         // function

  console.log("\n--- Passo 3: função em objeto ---");
  console.log(totalComPagamento(100, "pix"));      // 95
  console.log(totalComPagamento(100, "debito"));   // 100
  console.log(totalComPagamento(100, "credito"));  // 104
  console.log(totalComPagamento(100, "valeRefeicao")); // 100

  console.log("\n--- Passo 4: função em array ---");
  console.log(regrasDoPedido.length);              // 3
  console.log(aplicarEmSequencia(60));             // 49.4
  console.log(aplicarEmSequencia(100));            // 80.75

  console.log("\n--- Passo 5: função como parâmetro ---");
  console.log(aplicarRegras(60, regrasDoPedido));                         // 49.4
  console.log(fecharPedido([30, 25], cupomPrimeiraCompra));               // 40
  console.log(fecharPedido([30, 25], ajustePorPagamento.credito));        // 57.2
  console.log(fecharPedido([30, 25], (total) => total));                  // 55
  console.log(fecharPedido([30, 25], aplicarEmSequencia));                // 44.65
  console.log(
    fecharPedido([30, 25], (total) =>
      aplicarRegras(total, [cupomPrimeiraCompra, ajustePorPagamento.credito])),
  );                                                                      // 41.6
}

main();

// ==============================================================================
// RESPOSTAS DAS PERGUNTAS
// ==============================================================================
//
// 1. Classificação das funções
//
//    formatarPreco: PURA. A mesma entrada sempre produz a mesma saída e não há
//    efeito observável fora da função.
//
//    registrarPedido: IMPURA. Viola a regra "nenhum efeito observável fora
//    dela", porque escreve no console. O valor devolvido é sempre o mesmo, mas
//    a chamada deixa um rastro no mundo externo. Para torná-la pura, a função
//    apenas monta e devolve a mensagem, e o console.log fica na borda do
//    programa, no código que a chama:
//
//      function mensagemDoPedido(total: number): string {
//        return "Pedido registrado: R$ " + total;
//      }
//      console.log(mensagemDoPedido(total));
//
//    gerarCodigoRastreio: IMPURA. Viola a regra "mesma entrada, mesma saída":
//    sem nenhum parâmetro, cada chamada devolve um código diferente, porque
//    Math.random() lê um estado oculto (o gerador de números aleatórios). Para
//    torná-la pura, o número sorteado passa a ser recebido por parâmetro, e o
//    sorteio fica na borda:
//
//      function gerarCodigoRastreio(aleatorio: number): string {
//        return "BR" + Math.floor(aleatorio * 1000000);
//      }
//      gerarCodigoRastreio(Math.random());
//
// 2. precoDoHappyHourPuro recebe a hora por parâmetro: o teste escolhe a hora
//    (18, 21, ...) e sabe de antemão o resultado esperado, a qualquer momento
//    do dia. precoDoHappyHour lê o relógio internamente com new Date(), então o
//    resultado depende de quando o teste roda; para testar as duas faixas de
//    horário seria preciso substituir o Date por um mock (ou esperar dar 17h).
//    A dependência que antes era escondida passou a ser explícita na
//    assinatura, e o relógio foi empurrado para a borda do programa.
//
// 3. Depois de acrescentar "valeRefeicao" ao tipo, ajusteComSwitch continuou
//    compilando sem nenhum aviso: o novo valor cai no default e é tratado
//    silenciosamente como "sem ajuste", estivesse isso certo ou não.
//    ajustePorPagamento passou a dar erro de compilação:
//
//      error TS2741: Property 'valeRefeicao' is missing in type '{ pix: ...;
//      debito: ...; credito: ...; }' but required in type
//      'Record<FormaPagamento, RegraDePreco>'.
//
//    A tabela protegeu o sistema. O tipo Record<FormaPagamento, RegraDePreco>
//    exige uma função para cada forma de pagamento declarada, então o
//    compilador aponta exatamente o lugar onde falta decidir a regra nova. No
//    switch, o default esconde o esquecimento, e o erro só apareceria em
//    produção, como um valor cobrado errado.
//
// 4. fecharPedido([30, 25], cupomPrimeiraCompra) passa a PRÓPRIA FUNÇÃO (sem
//    parênteses) como argumento. fecharPedido soma os itens (55) e chama a
//    regra com esse valor, devolvendo 40.
//
//    fecharPedido([30, 25], cupomPrimeiraCompra(55)) executa o cupom ANTES da
//    chamada e passa o RESULTADO, o número 40, no lugar da regra. Como
//    fecharPedido espera uma RegraDePreco, o TypeScript recusa:
//
//      error TS2345: Argument of type 'number' is not assignable to parameter
//      of type 'RegraDePreco'.
//
//    Se o código fosse executado mesmo assim (o tsx não checa tipos),
//    fecharPedido tentaria chamar 40(55) e lançaria
//    "TypeError: regra is not a function".
