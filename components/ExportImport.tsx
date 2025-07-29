"use client"

import type React from "react"
import { useRef, useState } from "react"
import type { Asset } from "@/types/asset"
import { exportToExcel, importFromExcel, downloadTemplate } from "@/utils/excel"

interface ExportImportProps {
  assets: Asset[]
  onImport: (assets: Asset[]) => void
  onToast: (message: string, type: "success" | "error" | "info") => void
}

export default function ExportImport({ assets, onImport, onToast }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (assets.length === 0) {
      onToast("Tidak ada data untuk diekspor", "info")
      return
    }

    setIsExporting(true)
    try {
      onToast("Memproses export...", "info")
      await new Promise((resolve) => setTimeout(resolve, 500))
      exportToExcel(assets)
      onToast(`Data berhasil diekspor (${assets.length} aset)`, "success")
    } catch (error) {
      console.error("Export error:", error)
      const errorMessage = error instanceof Error ? error.message : "Gagal mengekspor data"
      onToast(errorMessage, "error")
      alert(`Error Export:\n\n${errorMessage}\n\nPastikan browser Anda mendukung download file.`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      onToast("Membuat template...", "info")
      await new Promise((resolve) => setTimeout(resolve, 300))
      downloadTemplate()
      onToast("Template berhasil diunduh", "success")
    } catch (error) {
      console.error("Template download error:", error)
      const errorMessage = error instanceof Error ? error.message : "Gagal mengunduh template"
      onToast(errorMessage, "error")
      alert(`Error Template:\n\n${errorMessage}`)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      onToast("Memproses file Excel...", "info")
      const importedAssets = await importFromExcel(file)

      const confirmMessage = `File berhasil diproses!

Ditemukan: ${importedAssets.length} aset valid
Data yang ada saat ini: ${assets.length} aset

Data baru akan DITAMBAHKAN ke data yang sudah ada (tidak menimpa).

Lanjutkan import?`

      if (confirm(confirmMessage)) {
        onImport(importedAssets)
        onToast(`Berhasil mengimpor ${importedAssets.length} aset`, "success")
      } else {
        onToast("Import dibatalkan", "info")
      }
    } catch (error) {
      console.error("Import error:", error)
      const errorMessage = error instanceof Error ? error.message : "Gagal mengimpor file"
      onToast(errorMessage, "error")
      alert(`Error Import:\n\n${errorMessage}`)
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="trakindo-card p-6 mb-8">
      <div className="border-l-4 border-accent pl-4 mb-6">
        <h2 className="text-xl font-semibold text-foreground">📊 Export & Import Data</h2>
        <p className="text-sm text-muted-foreground mt-1">Kelola data aset dengan export dan import Excel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-muted rounded-lg p-4 border border-border">
          <h3 className="text-lg font-medium text-foreground mb-3 flex items-center">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
              📥
            </span>
            Export Data
          </h3>
          <button
            onClick={handleExport}
            disabled={assets.length === 0 || isExporting}
            className="trakindo-button-primary w-full px-4 py-3 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Mengekspor...
              </>
            ) : (
              <>📥 Export ke Excel ({assets.length} aset)</>
            )}
          </button>
          {assets.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">Tidak ada data untuk diekspor</p>
          )}
        </div>

        {/* Import Section */}
        <div className="bg-accent/10 rounded-lg p-4 border border-border">
          <h3 className="text-lg font-medium text-foreground mb-3 flex items-center">
            <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
              📤
            </span>
            Import Data
          </h3>
          <div className="space-y-3">
            <label
              className={`trakindo-button-secondary w-full px-4 py-3 h-12 cursor-pointer ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-foreground mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>📤 Import Excel</>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                disabled={isImporting}
              />
            </label>

            <button
              onClick={handleDownloadTemplate}
              className="w-full px-4 py-2 h-10 bg-chart-2 text-white rounded-md hover:bg-chart-2/80 transition-colors font-medium"
            >
              📋 Download Template
            </button>
          </div>

          <div className="text-xs text-muted-foreground mt-3 space-y-1">
            <p>• Format yang didukung: .xlsx, .xls</p>
            <p>• Kolom wajib: Nomor Aset, Deskripsi, Lokasi, Cost Center</p>
            <p>• Download template untuk format yang benar</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
        <h4 className="font-medium text-foreground mb-2 flex items-center">
          <span className="text-primary mr-2">📝</span>
          Petunjuk Penggunaan:
        </h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong className="text-primary">Export:</strong> Unduh semua data aset dalam format Excel
          </p>
          <p>
            <strong className="text-accent">Template:</strong> Unduh template kosong untuk format import yang benar
          </p>
          <p>
            <strong className="text-chart-2">Import:</strong> Upload file Excel dengan data aset baru (akan ditambahkan
            ke data yang ada)
          </p>
        </div>
      </div>
    </div>
  )
}
