"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  DollarSign,
  LogOut,
  Bus,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/solicitacoes", label: "Solicitacoes", icon: ClipboardList },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  console.log("[v0] AdminLayout rendering, checking:", checking)

  useEffect(() => {
    console.log("[v0] AdminLayout useEffect - setting up auth check")
    try {
      const unsub = onAuthStateChanged(auth, (user) => {
        console.log("[v0] AdminLayout auth state:", user?.email)
        if (!user) {
          router.replace("/login")
        }
        setChecking(false)
      })
      return unsub
    } catch (e) {
      console.error("[v0] AdminLayout auth error:", e)
      setChecking(false)
    }
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.replace("/login")
  }

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-primary px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Bus className="h-6 w-6 text-primary-foreground" />
          <span className="text-base font-bold text-primary-foreground">
            Tia Wilma
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-primary-foreground md:hidden"
          type="button"
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
                type="button"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
          <button
            onClick={handleLogout}
            className="ml-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </nav>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card shadow-lg md:hidden">
          <nav className="flex flex-col p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary"
                  }`}
                  type="button"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-secondary"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href)
                setMobileMenuOpen(false)
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              type="button"
            >
              <item.icon
                className={`h-5 w-5 ${isActive ? "text-primary" : ""}`}
              />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:pb-6">
        {children}
      </main>
    </div>
  )
}
