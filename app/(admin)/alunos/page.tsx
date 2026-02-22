"use client"

import React from "react"

import { useEffect, useState, useCallback } from "react"
import {
  Users,
  Search,
  GraduationCap,
  Phone,
  MapPin,
  FileText,
  Upload,
  Download,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { listarAlunos, uploadContratoAssinado, registrarPagamento } from "@/lib/firestore"
import { gerarContratoPDF } from "@/lib/pdf"
import { atualizarStatusMensalidade, mesesLabels, type Aluno, type Mensalidade } from "@/lib/data"
import { toast } from "sonner"

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await listarAlunos()
      setAlunos(data)
    } catch {
      toast.error("Erro ao carregar alunos.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(search.toLowerCase()) ||
      a.responsavel_nome.toLowerCase().includes(search.toLowerCase()) ||
      a.escola.toLowerCase().includes(search.toLowerCase())
  )

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
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Alunos</h1>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
          {alunos.length}
        </span>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, responsavel ou escola..."
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {search ? "Nenhum aluno encontrado." : "Nenhum aluno cadastrado."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((aluno) => {
            const mensAtualizada = aluno.mensalidades.map((m) =>
              atualizarStatusMensalidade(m, aluno.contrato.multaPorcentagem)
            )
            const pagas = mensAtualizada.filter(
              (m) => m.status === "pago"
            ).length
            const atrasadas = mensAtualizada.filter(
              (m) => m.status === "atrasado"
            ).length

            return (
              <button
                key={aluno.id}
                onClick={() => setSelectedAluno(aluno)}
                className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:shadow-md"
                type="button"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      {aluno.nome}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {aluno.escola} - {aluno.turno}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      aluno.status === "ativo"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {aluno.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Resp: {aluno.responsavel_nome}</span>
                  <span>
                    {aluno.contrato.valorMensal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                    /mes
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                    {pagas} paga(s)
                  </span>
                  {atrasadas > 0 && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                      {atrasadas} atrasada(s)
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedAluno && (
        <AlunoDetailModal
          aluno={selectedAluno}
          onClose={() => setSelectedAluno(null)}
          onUpdate={() => {
            load()
            setSelectedAluno(null)
          }}
        />
      )}
    </div>
  )
}

// --- ALUNO DETAIL MODAL ---

function AlunoDetailModal({
  aluno,
  onClose,
  onUpdate,
}: {
  aluno: Aluno
  onClose: () => void
  onUpdate: () => void
}) {
  const [tab, setTab] = useState<"info" | "contrato" | "financeiro">("info")
  const [uploading, setUploading] = useState(false)
  const [showFinanceiro, setShowFinanceiro] = useState(false)
  const [payingIdx, setPayingIdx] = useState<number | null>(null)

  const mensalidades = aluno.mensalidades.map((m) =>
    atualizarStatusMensalidade(m, aluno.contrato.multaPorcentagem)
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !aluno.id) return
    setUploading(true)
    try {
      await uploadContratoAssinado(aluno.id, file)
      toast.success("Contrato assinado enviado!")
      onUpdate()
    } catch {
      toast.error("Erro ao enviar contrato.")
    } finally {
      setUploading(false)
    }
  }

  const handlePagar = async (idx: number) => {
    if (!aluno.id) return
    setPayingIdx(idx)
    try {
      await registrarPagamento(aluno.id, idx, aluno)
      toast.success("Pagamento registrado!")
      onUpdate()
    } catch {
      toast.error("Erro ao registrar pagamento.")
    } finally {
      setPayingIdx(null)
    }
  }

  function statusIcon(status: string) {
    if (status === "pago")
      return <CheckCircle className="h-4 w-4 text-emerald-600" />
    if (status === "atrasado")
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-amber-600" />
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      pago: "bg-emerald-100 text-emerald-700",
      atrasado: "bg-red-100 text-red-700",
      em_aberto: "bg-amber-100 text-amber-700",
    }
    const labels: Record<string, string> = {
      pago: "Pago",
      atrasado: "Atrasado",
      em_aberto: "Em Aberto",
    }
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${styles[status] || ""}`}
      >
        {labels[status] || status}
      </span>
    )
  }

  const formatMes = (mesKey: string) => {
    const [y, m] = mesKey.split("-")
    return `${mesesLabels[Number.parseInt(m) - 1]} ${y}`
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 md:items-center">
      <div className="animate-slide-up flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-card shadow-xl md:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {aluno.nome}
            </h2>
            <p className="text-xs text-muted-foreground">
              {aluno.escola} - {aluno.turno}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-transparent p-1 text-muted-foreground"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(
            [
              { id: "info", label: "Dados" },
              { id: "contrato", label: "Contrato" },
              { id: "financeiro", label: "Financeiro" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-center text-xs font-semibold transition-colors ${
                tab === t.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "info" && (
            <div className="flex flex-col gap-3 text-sm">
              <InfoRow label="Responsavel" value={aluno.responsavel_nome} />
              <InfoRow label="CPF" value={aluno.responsavel_cpf} />
              <InfoRow label="Telefone" value={aluno.telefone} />
              <InfoRow label="Endereco" value={aluno.endereco} />
              <InfoRow label="Escola" value={aluno.escola} />
              <InfoRow label="Turno" value={aluno.turno} />
              <InfoRow
                label="Valor Mensal"
                value={aluno.contrato.valorMensal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              />
              <InfoRow
                label="Vencimento"
                value={`Dia ${aluno.contrato.diaVencimento}`}
              />
              <InfoRow
                label="Multa"
                value={`${aluno.contrato.multaPorcentagem}%`}
              />
            </div>
          )}

          {tab === "contrato" && (
            <div className="flex flex-col gap-4">
              {aluno.contratoAssinadoUrl ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle className="h-4 w-4" />
                    Contrato assinado enviado
                  </p>
                  <a
                    href={aluno.contratoAssinadoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary underline"
                  >
                    <Download className="h-4 w-4" />
                    Baixar contrato assinado
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-3 text-sm text-amber-700">
                    Contrato assinado ainda nao enviado.
                  </p>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Enviando..." : "Enviar contrato assinado"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}

              <button
                onClick={() => {
                  gerarContratoPDF(
                    aluno.responsavel_nome,
                    aluno.responsavel_cpf,
                    aluno.endereco,
                    aluno.telefone,
                    [
                      {
                        nome: aluno.nome,
                        escola: aluno.escola,
                        turno: aluno.turno,
                      },
                    ],
                    aluno.contrato
                  )
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground"
                type="button"
              >
                <FileText className="h-4 w-4" />
                Gerar contrato para impressao
              </button>
            </div>
          )}

          {tab === "financeiro" && (
            <div className="flex flex-col gap-2">
              {mensalidades.map((m, idx) => (
                <div
                  key={m.mes}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    {statusIcon(m.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formatMes(m.mes)}
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
                    {statusBadge(m.status)}
                    {m.status !== "pago" && (
                      <button
                        onClick={() => handlePagar(idx)}
                        disabled={payingIdx === idx}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-emerald-50 disabled:opacity-50"
                        type="button"
                      >
                        {payingIdx === idx ? "..." : "Pagar"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-dashed border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
