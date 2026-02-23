"use client"

import React, { useState } from "react"
import { Bus, Send, CheckCircle, Plus, Trash2 } from "lucide-react"
import { criarSolicitacao } from "@/lib/firestore"
import { toast } from "sonner"
import type { AlunoSolicitado } from "@/lib/data"

interface AlunoForm {
  nome: string
  escola: string
  turno: string
}

const emptyAluno = (): AlunoForm => ({
  nome: "",
  escola: "",
  turno: "Manhã",
})

const escolas = [
  "CAIC",
  "Escola 06",
  "Escola 08",
  "CF 4",
  "Centrão",
  "Adventista",
  "Paraná",
  "Escola 03",
  "CF 3",
  "CEFA",
  "Magia dos Sonhos",
  "4 Estações",
]

export default function CadastroPage() {
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [responsavel, setResponsavel] = useState("")
  const [cpf, setCpf] = useState("")
  const [telefone, setTelefone] = useState("")
  const [endereco, setEndereco] = useState("")
  const [alunos, setAlunos] = useState<AlunoForm[]>([emptyAluno()])

  const addAluno = () => {
    if (alunos.length < 3) setAlunos([...alunos, emptyAluno()])
  }

  const removeAluno = (idx: number) => {
    setAlunos(alunos.filter((_, i) => i !== idx))
  }

  const updateAluno = (idx: number, field: keyof AlunoForm, value: string) => {
    const updated = [...alunos]
    updated[idx] = { ...updated[idx], [field]: value }
    setAlunos(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!responsavel || !cpf || !telefone || !endereco) return

    const validAlunos = alunos.filter((a) => a.nome.trim())

    if (validAlunos.length === 0) {
      toast.error("Informe pelo menos um aluno.")
      return
    }

    setLoading(true)

    try {
      await criarSolicitacao({
        responsavel_nome: responsavel,
        responsavel_cpf: cpf,
        telefone,
        endereco,
        alunos: validAlunos as AlunoSolicitado[],
      })

      setEnviado(true)
    } catch {
      toast.error("Erro ao enviar solicitação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-primary">
            Solicitação Enviada!
          </h1>

          <p className="mb-6 text-sm text-muted-foreground">
            Sua solicitação de vaga foi recebida com sucesso. Entraremos em
            contato em breve pelo telefone informado.
          </p>

          <button
            onClick={() => {
              setEnviado(false)
              setResponsavel("")
              setCpf("")
              setTelefone("")
              setEndereco("")
              setAlunos([emptyAluno()])
            }}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            type="button"
          >
            Enviar outra solicitação
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="flex h-[60px] items-center justify-center border-b border-border bg-card shadow-sm">
        <h1 className="flex items-center gap-2 text-lg font-bold text-primary">
          <Bus className="h-5 w-5 text-accent" />
          Tia Wilma - Transporte Escolar
        </h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary">
            Solicitar Vaga de Transporte
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os dados abaixo. Você pode cadastrar até 3 alunos, cada um
            com escola e turno diferentes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Dados do Responsável */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Dados do Responsável
            </h3>

            <div className="flex flex-col gap-4">
              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                required
                placeholder="Nome completo"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
              />

              <input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
                placeholder="000.000.000-00"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
              />

              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                placeholder="WhatsApp"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
              />

              <input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                required
                placeholder="Endereço completo"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
              />
            </div>
          </section>

          {/* Alunos */}
          {alunos.map((aluno, idx) => (
            <section
              key={idx}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-muted-foreground">
                  Aluno {idx + 1}
                </h3>

                {alunos.length > 1 && (
                  <button type="button" onClick={() => removeAluno(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <input
                  value={aluno.nome}
                  onChange={(e) => updateAluno(idx, "nome", e.target.value)}
                  required={idx === 0}
                  placeholder="Nome do aluno"
                  className="w-full rounded-xl border border-input px-4 py-3 text-sm"
                />

                {/* SELECT PROFISSIONAL */}
                <select
                  value={aluno.escola}
                  onChange={(e) => updateAluno(idx, "escola", e.target.value)}
                  required={idx === 0}
                  className="w-full rounded-xl border border-input px-4 py-3 text-sm"
                >
                  <option value="">Selecione a escola</option>

                  {escolas.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>

                <select
                  value={aluno.turno}
                  onChange={(e) => updateAluno(idx, "turno", e.target.value)}
                  className="w-full rounded-xl border border-input px-4 py-3 text-sm"
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Integral">Integral</option>
                </select>
              </div>
            </section>
          ))}

          {alunos.length < 3 && (
            <button type="button" onClick={addAluno}>
              <Plus className="h-4 w-4 inline mr-2" />
              Adicionar outro aluno
            </button>
          )}

          <button type="submit" disabled={loading}>
            <Send className="h-4 w-4 inline mr-2" />
            {loading ? "Enviando..." : "Solicitar Vaga"}
          </button>
        </form>
      </main>
    </div>
  )
}