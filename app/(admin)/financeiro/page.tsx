"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { listarAlunos, registrarPagamento } from "@/lib/firestore"
import { atualizarStatusMensalidade, mesesLabels, type Aluno, type Mensalidade } from "@/lib/data"
import { toast } from "sonner"

export default function FinanceiroPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [mesAtual, setMesAtual] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  const load = useCallback(async () => {
    try {
      const data = await listarAlunos()
      setAlunos(data.filter((a) => a.status === "ativo"))
    } catch {
      toast.error("Erro ao carregar dados financeiros.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handlePagar = async (aluno: Aluno, idx: number) => {
    if (!aluno.id) return
    try {
      await registrarPagamento(aluno.id, idx, aluno)
      toast.success("Pagamento registrado!")
      load()
    } catch {
      toast.error("Erro ao registrar pagamento.")
    }
  }

  // Navigate months
  const navMes = (dir: number) => {
    const [y, m] = mesAtual.split("-").map(Number)
    let newM = m + dir
    let newY = y
    if (newM > 12) {
      newM = 1
      newY++
    }
    if (newM < 1) {
      newM = 12
      newY--
    }
    setMesAtual(`${newY}-${String(newM).padStart(2, "0")}`)
  }

  // Filter mensalidades for the selected month
  const dadosMes = useMemo(() => {
    const items: {
      aluno: Aluno
      mensalidade: Mensalidade
      originalIdx: number
    }[] = []

    for (const aluno of alunos) {
      for (let i = 0; i < aluno.mensalidades.length; i++) {
        const m = aluno.mensalidades[i]
        if (m.mes === mesAtual) {
          const updated = atualizarStatusMensalidade(
            m,
            aluno.contrato.multaPorcentagem
          )
          items.push({ aluno, mensalidade: updated, originalIdx: i })
        }
      }
    }
    return items
  }, [alunos, mesAtual])

  // KPIs
  const totalEsperado = dadosMes.reduce((s, d) => s + d.mensalidade.valor, 0)
  const totalRecebido = dadosMes
    .filter((d) => d.mensalidade.status === "pago")
    .reduce((s, d) => s + d.mensalidade.valor, 0)
  const totalPendente = dadosMes
    .filter((d) => d.mensalidade.status !== "pago")
    .reduce((s, d) => s + d.mensalidade.valor + d.mensalidade.multa, 0)
  const qtdPagos = dadosMes.filter((d) => d.mensalidade.status === "pago").length
  const qtdPendentes = dadosMes.filter(
    (d) => d.mensalidade.status !== "pago"
  ).length

  // Pie chart
  const total = qtdPagos + qtdPendentes
  const pctPagos = total > 0 ? (qtdPagos / total) * 100 : 0

  const [y, m] = mesAtual.split("-").map(Number)
  const mesLabel = `${mesesLabels[m - 1]} ${y}`

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
      </div>

      {/* Month selector */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm">
        <button
          onClick={() => navMes(-1)}
          className="rounded-lg bg-transparent p-2 text-muted-foreground hover:text-foreground"
          type="button"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-foreground">{mesLabel}</span>
        <button
          onClick={() => navMes(1)}
          className="rounded-lg bg-transparent p-2 text-muted-foreground hover:text-foreground"
          type="button"
          aria-label="Proximo mes"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <TrendingUp className="h-4 w-4 text-blue-700" />
          </div>
          <p className="text-xs text-muted-foreground">Esperado</p>
          <p className="text-sm font-bold text-foreground">
            {totalEsperado.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="text-xs text-muted-foreground">Recebido</p>
          <p className="text-sm font-bold text-emerald-700">
            {totalRecebido.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-700" />
          </div>
          <p className="text-xs text-muted-foreground">Pendente</p>
          <p className="text-sm font-bold text-red-700">
            {totalPendente.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      {/* Pie Chart */}
      {total > 0 && (
        <div className="mb-5 flex items-center justify-center gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <svg viewBox="0 0 36 36" className="h-24 w-24">
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#16a34a"
              strokeWidth="3"
              strokeDasharray={`${pctPagos} ${100 - pctPagos}`}
              strokeDashoffset="25"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span className="text-foreground">
                Pagos: {qtdPagos} ({pctPagos.toFixed(0)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="text-foreground">
                Pendentes: {qtdPendentes} ({(100 - pctPagos).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment list */}
      {dadosMes.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <DollarSign className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Nenhuma mensalidade para este mes.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {dadosMes.map((item) => {
            const m = item.mensalidade
            return (
              <div
                key={`${item.aluno.id}-${m.mes}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {m.status === "pago" ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : m.status === "atrasado" ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.aluno.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Venc: {m.vencimento.split("-").reverse().join("/")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {m.valor.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    {m.multa > 0 && (
                      <p className="text-[10px] text-red-600">
                        +{" "}
                        {m.multa.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}{" "}
                        multa
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      m.status === "pago"
                        ? "bg-emerald-100 text-emerald-700"
                        : m.status === "atrasado"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {m.status === "pago"
                      ? "Pago"
                      : m.status === "atrasado"
                        ? "Atrasado"
                        : "Em Aberto"}
                  </span>
                  {m.status !== "pago" && (
                    <button
                      onClick={() =>
                        handlePagar(item.aluno, item.originalIdx)
                      }
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-emerald-50"
                      type="button"
                    >
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
