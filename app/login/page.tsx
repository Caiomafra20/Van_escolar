"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Copy,
  Check,
  Bus,
  ArrowLeft,
  Link2,
} from "lucide-react"

type Screen = "login" | "forgot" | "forgot-sent"

console.log("[v0] LoginPage module loaded")

export default function LoginPage() {
  console.log("[v0] LoginPage rendering")
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const cadastroLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/cadastro`
      : "/cadastro"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch {
      setError("Email ou senha incorretos.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setScreen("forgot-sent")
    } catch {
      toast.error("Erro ao enviar email de recuperacao.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cadastroLink)
    setCopied(true)
    toast.success("Link copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  // --- FORGOT PASSWORD SENT ---
  if (screen === "forgot-sent") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-secondary px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Mail className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-foreground">
              Email enviado!
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Verifique sua caixa de entrada e siga as instrucoes para redefinir
              sua senha.
            </p>
            <button
              onClick={() => {
                setScreen("login")
                setResetEmail("")
              }}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              type="button"
            >
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- FORGOT PASSWORD FORM ---
  if (screen === "forgot") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-secondary px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <button
              onClick={() => setScreen("login")}
              className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <h2 className="mb-1 text-lg font-bold text-foreground">
              Esqueci minha senha
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Digite seu email para receber o link de recuperacao.
            </p>
            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar link de recuperacao"}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // --- LOGIN ---
  return (
    <div className="flex min-h-dvh items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Bus className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Tia Wilma</h1>
          <p className="text-sm text-muted-foreground">Transporte Escolar</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h2 className="mb-5 text-center text-base font-semibold text-foreground">
            Entrar no sistema
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tiawilma.site"
                  required
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Senha
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-muted-foreground"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => setScreen("forgot")}
              className="text-center text-xs text-muted-foreground underline"
            >
              Esqueci minha senha
            </button>
          </form>
        </div>

        {/* Cadastro Link Block */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Link2 className="h-4 w-4 text-accent" />
            Link do cadastro dos pais
          </div>
          <p className="mb-3 break-all rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {cadastroLink}
          </p>
          <button
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
            type="button"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar link do cadastro
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
