import type { DadosContrato, AlunoSolicitado } from "./data"

function formatCurrency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(d: string): string {
  if (!d) return ""
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

export function gerarContratoPDF(
  responsavel: string,
  cpf: string,
  endereco: string,
  telefone: string,
  alunos: AlunoSolicitado[],
  contrato: DadosContrato
): void {
  const alunosTexto = alunos
    .map((a) => `${a.nome} (${a.escola} - ${a.turno})`)
    .join("; ")

  const conteudo = `
CONTRATO DE PRESTACAO DE SERVICOS DE TRANSPORTE ESCOLAR

CONTRATANTE: ${responsavel}
CPF: ${cpf}
ENDERECO: ${endereco}
TELEFONE: ${telefone}

ALUNO(S) TRANSPORTADO(S): ${alunosTexto}

CLAUSULA 1 - DO OBJETO
O presente contrato tem por objeto a prestacao de servicos de transporte escolar
do(s) aluno(s) acima identificado(s), da residencia ate a escola, e vice-versa.

CLAUSULA 2 - DO VALOR E PAGAMENTO
Valor total anual: ${formatCurrency(contrato.valorTotalAnual)}
Quantidade de parcelas: ${contrato.qtdParcelas}
Valor mensal: ${formatCurrency(contrato.valorMensal)}
Vencimento: dia ${contrato.diaVencimento} de cada mes.
Data de inicio do contrato: ${formatDate(contrato.dataInicio)}.

CLAUSULA 3 - DA MULTA POR ATRASO
Em caso de atraso no pagamento, incidira multa de ${contrato.multaPorcentagem}%
sobre o valor da mensalidade.

CLAUSULA 4 - DAS OBRIGACOES DO CONTRATANTE
a) Efetuar o pagamento da mensalidade ate a data de vencimento;
b) Comunicar com antecedencia qualquer ausencia do aluno;
c) Manter os dados cadastrais atualizados;
d) Aguardar o veiculo no local e horario combinados.

CLAUSULA 5 - DAS OBRIGACOES DO TRANSPORTADOR
a) Transportar o aluno com seguranca e pontualidade;
b) Manter o veiculo em perfeitas condicoes de uso;
c) Possuir todas as autorizacoes legais necessarias;
d) Manter seguro adequado para o transporte escolar.

CLAUSULA 6 - DA VIGENCIA
Este contrato tem vigencia de ${contrato.qtdParcelas} meses a partir de
${formatDate(contrato.dataInicio)}, podendo ser renovado mediante acordo entre as partes.

CLAUSULA 7 - DA RESCISAO
A rescisao devera ser comunicada com 30 dias de antecedencia, sob pena
de multa equivalente a uma mensalidade.

Data: ${new Date().toLocaleDateString("pt-BR")}


_______________________________
${responsavel}
Contratante


_______________________________
Tia Wilma - Transporte Escolar
Contratado
  `.trim()

  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Contrato - ${responsavel}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      padding: 50px;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.9;
      font-size: 13px;
      color: #222;
    }
    pre {
      white-space: pre-wrap;
      font-family: 'Times New Roman', serif;
      font-size: 13px;
      line-height: 1.9;
    }
    .btn-print {
      position: fixed;
      top: 15px;
      right: 15px;
      padding: 10px 24px;
      background: #6b2c3e;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-family: Arial, sans-serif;
    }
    .btn-print:hover { opacity: 0.9; }
    @media print { .btn-print { display: none; } }
  </style>
</head>
<body>
  <button class="btn-print" onclick="window.print()">Imprimir / Salvar PDF</button>
  <pre>${conteudo}</pre>
</body>
</html>`)
    printWindow.document.close()
  }
}
