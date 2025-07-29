"use client"

import { useState } from "react"
import type { ValidationIssue } from "@/types/table"

interface ValidationPanelProps {
  issues: ValidationIssue[]
  onFixIssue?: (assetId: string) => void
}

export default function ValidationPanel({ issues, onFixIssue }: ValidationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const errorCount = issues.filter((issue) => issue.severity === "error").length
  const warningCount = issues.filter((issue) => issue.severity === "warning").length

  if (issues.length === 0) {
    return (
      <div className="bg-chart-1/10 border border-chart-1/20 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="text-chart-1 text-xl mr-3">✅</div>
          <div>
            <h3 className="text-chart-1 font-medium">Validasi Berhasil</h3>
            <p className="text-chart-1/80 text-sm">Semua data aset valid dan tidak ada masalah yang ditemukan.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="trakindo-card mb-6">
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-xl mr-3">{errorCount > 0 ? "❌" : "⚠️"}</div>
            <div>
              <h3 className="font-medium text-foreground flex items-center">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs mr-2">VALIDASI</span>
                Data Aset
                {errorCount > 0 && (
                  <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs ml-2">
                    {errorCount} Error
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="bg-chart-4 text-chart-4-foreground px-2 py-1 rounded-full text-xs ml-2">
                    {warningCount} Warning
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {issues.length} masalah ditemukan - Klik untuk melihat detail
              </p>
            </div>
          </div>
          <div className="text-muted-foreground text-lg">{isExpanded ? "▼" : "▶"}</div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border">
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {issues.map((issue, index) => (
              <div
                key={`${issue.id}-${index}`}
                className={`p-3 rounded-lg border ${
                  issue.severity === "error"
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-chart-4/10 border-chart-4/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-foreground">{issue.assetNumber}</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                          issue.severity === "error"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-chart-4 text-white"
                        }`}
                      >
                        {issue.severity === "error" ? "ERROR" : "WARNING"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{issue.issue}</p>
                  </div>
                  {onFixIssue && (
                    <button
                      onClick={() => onFixIssue(issue.id)}
                      className="ml-3 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      Perbaiki
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
