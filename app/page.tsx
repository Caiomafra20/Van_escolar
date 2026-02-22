"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  console.log("[v0] Root page rendering")
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
