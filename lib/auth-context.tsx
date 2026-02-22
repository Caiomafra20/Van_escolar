"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  console.log("[v0] AuthProvider rendering, loading:", loading)

  useEffect(() => {
    console.log("[v0] AuthProvider useEffect - setting up onAuthStateChanged")
    try {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        console.log("[v0] Auth state changed, user:", u?.email)
        setUser(u)
        setLoading(false)
      })
      return unsubscribe
    } catch (e) {
      console.error("[v0] Auth state error:", e)
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signOutFn = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut: signOutFn }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
