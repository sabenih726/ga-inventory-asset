"use client"

import type React from "react"
import { useState } from "react"
import type { AssetFormData, Asset } from "@/types/asset"
import { ASSET_CONDITION_OPTIONS } from "@/types/asset"
import BarcodeScanner from "./BarcodeScanner"

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void
  onCancel?: () => void
  initialData?: Asset
  isEditing?: boolean
  onToast: (message: string, type: "success" | "error" | "info") => void
}

export default function AssetForm({ onSubmit, onCancel, initialData, isEditing = false, onToast }: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    assetNumber: initialData?.assetNumber || "",
    assetDescription: initialData?.assetDescription || "",
    assetLocation: initialData?.assetLocation || "",
    costCenter: initialData?.costCenter || "",
    condition: initialData?.condition || "bagus",
  })
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleScanSuccess = (decodedText: string) => {
    setFormData((prev) => ({ ...prev, assetNumber: decodedText }))
    onToast(`Barcode berhasil dipindai: ${decodedText}`, "success")
  }

  const handleScanError = (error: string) => {
    onToast(error, "error")
  }

  const resetForm = () => {
    setFormData({
      assetNumber: "",
      assetDescription: "",
      assetLocation: "",
      costCenter: "",
      condition: "bagus",
    })
  }

  return (
    <>
      <div className="trakindo-card p-6 mb-8">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <h2 className="text-xl font-semibold text-foreground">📝 {isEditing ? "Edit Aset" : "Form Input Aset"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? "Perbarui informasi aset" : "Tambahkan aset baru ke sistem"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Nomor Aset dan Cost Center */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nomor Aset */}
            <div>
              <label htmlFor="assetNumber" className="block text-sm font-medium text-foreground mb-2">
                Nomor Aset <span className="text-destructive">*</span>
              </label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="assetNumber"
                  name="assetNumber"
                  value={formData.assetNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Scan atau ketik manual"
                  className="trakindo-input flex-1 rounded-none rounded-l-md"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h4.586A1 1 0 019.293 3.707l1.414 1.414a1 1 0 00.707.293h3.172a1 1 0 01.707 1.707l-1.414 1.414A1 1 0 0014.586 9H10a1 1 0 01-1-1V3.414A1 1 0 007.586 2H4a1 1 0 01-1-1zM2 11a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H8a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H8a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cost Center */}
            <div>
              <label htmlFor="costCenter" className="block text-sm font-medium text-foreground mb-2">
                Cost Center <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="costCenter"
                name="costCenter"
                value={formData.costCenter}
                onChange={handleInputChange}
                required
                placeholder="Contoh: CC-001, IT-DEPT, HR-001"
                className="trakindo-input w-full"
              />
            </div>
          </div>

          {/* Row 2: Kondisi Aset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kondisi Aset */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-foreground mb-2">
                Kondisi Aset <span className="text-destructive">*</span>
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
                className="trakindo-input w-full"
              >
                {ASSET_CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Empty space for layout balance */}
            <div></div>
          </div>

          {/* Deskripsi Aset */}
          <div>
            <label htmlFor="assetDescription" className="block text-sm font-medium text-foreground mb-2">
              Deskripsi Aset <span className="text-destructive">*</span>
            </label>
            <textarea
              id="assetDescription"
              name="assetDescription"
              value={formData.assetDescription}
              onChange={handleInputChange}
              required
              rows={3}
              placeholder="Contoh: Meja Kerja Staff dengan laci 3 tingkat, warna coklat"
              className="trakindo-input w-full resize-none"
            />
          </div>

          {/* Lokasi Aset */}
          <div>
            <label htmlFor="assetLocation" className="block text-sm font-medium text-foreground mb-2">
              Lokasi Aset <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="assetLocation"
              name="assetLocation"
              value={formData.assetLocation}
              onChange={handleInputChange}
              required
              placeholder="Contoh: Ruang Meeting Lt. 5, Gedung A"
              className="trakindo-input w-full"
            />
          </div>

          {/* Tombol Submit */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="submit" className="trakindo-button-primary px-6 py-2 h-10">
              {isEditing ? "✏️ Update Aset" : "➕ Tambah Aset"}
            </button>
            {isEditing && onCancel && (
              <button type="button" onClick={onCancel} className="trakindo-button-secondary px-6 py-2 h-10">
                ❌ Batal
              </button>
            )}
            {!isEditing && (
              <button type="button" onClick={resetForm} className="trakindo-button-secondary px-6 py-2 h-10">
                🔄 Reset
              </button>
            )}
          </div>
        </form>
      </div>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onError={handleScanError}
      />
    </>
  )
}
