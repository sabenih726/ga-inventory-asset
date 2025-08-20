"use client"

import { useEffect } from "react"
import type { ToastMessage } from "@/types/asset"

interface ToastProps {
  toast: ToastMessage | null
  onClose: () => void
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  if (!toast) return null

  const bgColor = {
    success: "bg-chart-1 border-chart-1/20",
    error: "bg-destructive border-destructive/20",
    info: "bg-chart-2 border-chart-2/20",
  }[toast.type]

  const icon = {
    success: "✅",
    error: "❌",
    info: "ℹ���",
  }[toast.type]

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg border max-w-sm`}>
        <div className="flex items-center">
          <span className="mr-3 text-lg">{icon}</span>
          <span className="font-medium">{toast.message}</span>
        </div>
      </div>
    </div>
  )
}
