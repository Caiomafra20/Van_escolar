"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ClipboardList,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { listarSolicitacoes, listarAlunos } from "@/lib/firestore"
import { atualizarStatusMensalidade, type Aluno, type Solicitacao } from "@/lib/data"

export default function DashboardPage() {
  const router = useRouter()
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [sols, als] = await Promise.all([
          listarSolicitacoes("pendente"),
          listarAlunos(),
        ])
        setSolicitacoes(sols)
        setAlunos(als)
      } catch (err) {
        console.error("Error loading dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const alunosAtivos = alunos.filter((a) => a.status === "ativo")

  // Calculate financial summary
  let faturamentoEsperado = 0
  let totalRecebido = 0
  let totalAtrasado = 0

  for (const aluno of alunosAtivos) {
    for (const m of aluno.mensalidades) {
      const updated = atualizarStatusMensalidade(m, aluno.contrato.multaPorcentagem)
      faturamentoEsperado += updated.valor
      if (updated.status === "pago") {
        totalRecebido += updated.valor
      }
      if (updated.status === "atrasado") {
        totalAtrasado += updated.valor + updated.multa
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const stats = [
    {
      label: "Solicitacoes Pendentes",
      value: solicitacoes.length,
      icon: ClipboardList,
      color: "bg-amber-100 text-amber-700",
      href: "/solicitacoes",
    },
    {
      label: "Alunos Ativos",
      value: alunosAtivos.length,
      icon: Users,
      color: "bg-emerald-100 text-emerald-700",
      href: "/alunos",
    },
    {
      label: "Faturamento Esperado",
      value: faturamentoEsperado.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      icon: DollarSign,
      color: "bg-blue-100 text-blue-700",
      href: "/financeiro",
    },
    {
      label: "Total Atrasado",
      value: totalAtrasado.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700",
      href: "/financeiro",
    },
  ]

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => router.push(stat.href)}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:shadow-md"
            type="button"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Acoes Rapidas
        </h2>
        {solicitacoes.length > 0 && (
          <button
            onClick={() => router.push("/solicitacoes")}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <ClipboardList className="h-5 w-5 text-amber-700" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {solicitacoes.length} solicitacao(oes) pendente(s)
                </p>
                <p className="text-xs text-muted-foreground">
                  Revisar e aprovar cadastros
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={() => router.push("/alunos")}
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Users className="h-5 w-5 text-emerald-700" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">
                Gerenciar alunos
              </p>
              <p className="text-xs text-muted-foreground">
                Ver contratos e financeiro
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
