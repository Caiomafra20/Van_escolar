// --- TYPES for Firestore collections ---

export interface AlunoSolicitado {
  nome: string
  escola: string
  turno: string
}

export interface Solicitacao {
  id?: string
  responsavel_nome: string
  responsavel_cpf: string
  telefone: string
  endereco: string
  alunos: AlunoSolicitado[]
  status: "pendente" | "aprovado" | "rejeitado"
  criadoEm: string
}

export interface DadosContrato {
  valorTotalAnual: number
  qtdParcelas: number
  valorMensal: number
  diaVencimento: number
  multaPorcentagem: number
  dataInicio: string
}

export interface Mensalidade {
  parcela: number
  mes: string
  vencimento: string
  valor: number
  multa: number
  status: "em_aberto" | "pago" | "atrasado"
  dataPagamento?: string
}

export interface Aluno {
  id?: string
  solicitacaoId: string
  nome: string
  escola: string
  turno: string
  responsavel_nome: string
  responsavel_cpf: string
  telefone: string
  endereco: string
  contrato: DadosContrato
  mensalidades: Mensalidade[]
  contratoAssinadoUrl?: string
  status: "ativo" | "inativo"
  criadoEm: string
}

// --- HELPERS ---

export const mesesLabels = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export function gerarMensalidades(contrato: DadosContrato): Mensalidade[] {
  const mensalidades: Mensalidade[] = []
  const [anoStr, mesStr] = contrato.dataInicio.split("-")
  const startYear = Number.parseInt(anoStr)
  const startMonth = Number.parseInt(mesStr)

  for (let i = 0; i < contrato.qtdParcelas; i++) {
    const totalMonth = startMonth + i
    const year = startYear + Math.floor((totalMonth - 1) / 12)
    const month = ((totalMonth - 1) % 12) + 1
    const mesKey = `${year}-${String(month).padStart(2, "0")}`
    const maxDia = new Date(year, month, 0).getDate()
    const dia = String(Math.min(contrato.diaVencimento, maxDia)).padStart(2, "0")
    const vencimento = `${year}-${String(month).padStart(2, "0")}-${dia}`

    mensalidades.push({
      parcela: i + 1,
      mes: mesKey,
      vencimento,
      valor: contrato.valorMensal,
      multa: 0,
      status: "em_aberto",
    })
  }
  return mensalidades
}

export function atualizarStatusMensalidade(
  m: Mensalidade,
  multaPct: number
): Mensalidade {
  if (m.status === "pago") return m
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(m.vencimento + "T00:00:00")
  if (hoje > venc) {
    return {
      ...m,
      status: "atrasado",
      multa: Number((m.valor * (multaPct / 100)).toFixed(2)),
    }
  }
  return { ...m, status: "em_aberto", multa: 0 }
}
