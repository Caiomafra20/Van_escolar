"use client"

import { useEffect, useState, useCallback } from "react"
import {
  ClipboardList,
  Phone,
  MapPin,
  UserCheck,
  X,
  XCircle,
  GraduationCap,
  DollarSign,
  Calendar,
  Percent,
  Hash,
} from "lucide-react"
import {
  listarSolicitacoes,
  aprovarSolicitacao,
  rejeitarSolicitacao,
} from "@/lib/firestore"
import { gerarContratoPDF } from "@/lib/pdf"
import { toast } from "sonner"
import type { Solicitacao, AlunoSolicitado, DadosContrato } from "@/lib/data"

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [aprovarSol, setAprovarSol] = useState<Solicitacao | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await listarSolicitacoes("pendente")
      setSolicitacoes(data)
    } catch {
      toast.error("Erro ao carregar solicitacoes.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleRejeitar = async (id: string) => {
    if (!confirm("Rejeitar esta solicitacao?")) return
    await rejeitarSolicitacao(id)
    toast.success("Solicitacao rejeitada.")
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Solicitacoes</h1>
        {solicitacoes.length > 0 && (
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
            {solicitacoes.length}
          </span>
        )}
      </div>

      {solicitacoes.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <ClipboardList className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Nenhuma solicitacao pendente.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {solicitacoes.map((s) => {
            const tel = s.telefone.replace(/\D/g, "")
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {s.responsavel_nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CPF: {s.responsavel_cpf}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                    Pendente
                  </span>
                </div>

                <div className="mb-3 flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    {s.telefone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {s.endereco}
                  </span>
                </div>

                {/* Alunos list */}
                <div className="mb-3 flex flex-col gap-1">
                  {s.alunos.map((al, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs"
                    >
                      <GraduationCap className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground">
                        {al.nome}
                      </span>
                      <span className="text-muted-foreground">
                        {al.escola} - {al.turno}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/55${tel}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-emerald-50 no-underline"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                  <button
                    onClick={() => setAprovarSol(s)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                    type="button"
                  >
                    <UserCheck className="h-4 w-4" />
                    Aprovar
                  </button>
                </div>

                <button
                  onClick={() => handleRejeitar(s.id!)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive bg-transparent px-3 py-2 text-sm font-medium text-destructive"
                  type="button"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </button>
              </div>
            )
          })}
        </div>
      )}

      {aprovarSol && (
        <ApproveModal
          solicitacao={aprovarSol}
          onClose={() => setAprovarSol(null)}
          onDone={() => {
            setAprovarSol(null)
            load()
          }}
        />
      )}
    </div>
  )
}

// --- APPROVE MODAL ---

function ApproveModal({
  solicitacao,
  onClose,
  onDone,
}: {
  solicitacao: Solicitacao
  onClose: () => void
  onDone: () => void
}) {
  const [alunosEdit, setAlunosEdit] = useState<AlunoSolicitado[]>(
    solicitacao.alunos.map((a) => ({ ...a }))
  )
  const [endereco, setEndereco] = useState(solicitacao.endereco)
  const [valorTotalAnual, setValorTotalAnual] = useState(4800)
  const [qtdParcelas, setQtdParcelas] = useState(12)
  const [diaVencimento, setDiaVencimento] = useState(10)
  const [multaPorcentagem, setMultaPorcentagem] = useState(2)
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [loading, setLoading] = useState(false)

  const valorMensal =
    qtdParcelas > 0
      ? Number((valorTotalAnual / qtdParcelas).toFixed(2))
      : 0

  const updateAluno = (
    idx: number,
    field: keyof AlunoSolicitado,
    value: string
  ) => {
    const updated = [...alunosEdit]
    updated[idx] = { ...updated[idx], [field]: value }
    setAlunosEdit(updated)
  }

  const handleAprovar = async () => {
    setLoading(true)
    try {
      const contrato: DadosContrato = {
        valorTotalAnual,
        qtdParcelas,
        valorMensal,
        diaVencimento,
        multaPorcentagem,
        dataInicio,
      }

      await aprovarSolicitacao(solicitacao, alunosEdit, endereco, contrato)

      gerarContratoPDF(
        solicitacao.responsavel_nome,
        solicitacao.responsavel_cpf,
        endereco,
        solicitacao.telefone,
        alunosEdit,
        contrato
      )

      toast.success("Solicitacao aprovada com sucesso!")
      onDone()
    } catch {
      toast.error("Erro ao aprovar solicitacao.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 md:items-center">
      <div className="animate-slide-up max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl md:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">
            Conferencia e Aprovacao
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-transparent p-1 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dados da solicitacao */}
        <section className="mb-5 rounded-xl border border-border bg-secondary p-4">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Dados da Solicitacao
          </h3>
          <div className="flex flex-col gap-1 text-sm">
            <p>
              <span className="text-muted-foreground">Responsavel:</span>{" "}
              <strong>{solicitacao.responsavel_nome}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">CPF:</span>{" "}
              <strong>{solicitacao.responsavel_cpf}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Telefone:</span>{" "}
              <strong>{solicitacao.telefone}</strong>
            </p>
          </div>
        </section>

        {/* Endereco editavel */}
        <div className="mb-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Endereco
          </label>
          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Alunos editaveis */}
        <section className="mb-5">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Alunos
          </h3>
          <div className="flex flex-col gap-3">
            {alunosEdit.map((al, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-secondary p-3"
              >
                <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">
                  Aluno {idx + 1}
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    value={al.nome}
                    onChange={(e) => updateAluno(idx, "nome", e.target.value)}
                    placeholder="Nome"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <input
                      value={al.escola}
                      onChange={(e) =>
                        updateAluno(idx, "escola", e.target.value)
                      }
                      placeholder="Escola"
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />
                    <select
                      value={al.turno}
                      onChange={(e) =>
                        updateAluno(idx, "turno", e.target.value)
                      }
                      className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    >
                      <option value="Manha">Manha</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dados do contrato */}
        <section className="mb-5">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Dados do Contrato
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                Valor Total Anual (R$)
              </label>
              <input
                type="number"
                value={valorTotalAnual}
                onChange={(e) => setValorTotalAnual(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                Qtd Parcelas
              </label>
              <input
                type="number"
                value={qtdParcelas}
                onChange={(e) => setQtdParcelas(Number(e.target.value))}
                min={1}
                max={24}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="rounded-xl bg-secondary px-4 py-3">
              <span className="text-xs text-muted-foreground">
                Valor Mensal:
              </span>{" "}
              <span className="text-sm font-bold text-primary">
                {valorMensal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Dia de Vencimento
              </label>
              <input
                type="number"
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(Number(e.target.value))}
                min={1}
                max={28}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Percent className="h-3.5 w-3.5" />
                Multa por Atraso (%)
              </label>
              <input
                type="number"
                value={multaPorcentagem}
                onChange={(e) => setMultaPorcentagem(Number(e.target.value))}
                min={0}
                step={0.5}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Data de Inicio
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleAprovar}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-emerald-50 disabled:opacity-50"
            type="button"
          >
            <UserCheck className="h-4 w-4" />
            {loading ? "Aprovando..." : "Aprovar Cadastro"}
          </button>
        </div>
      </div>
    </div>
  )
}
