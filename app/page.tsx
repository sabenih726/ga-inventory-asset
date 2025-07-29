"use client"

import { useState } from "react"
import type { AssetFormData, ToastMessage } from "@/types/asset"
import { useAssets } from "@/hooks/useAssets"
import AssetForm from "@/components/AssetForm"
import AdvancedAssetTable from "@/components/AdvancedAssetTable"
import ExportImport from "@/components/ExportImport"
import Toast from "@/components/Toast"

export default function Home() {
  const { assets, setAssets, isLoading, editingIndex, addAsset, updateAsset, deleteAsset, startEdit, cancelEdit } =
    useAssets()

  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type })
  }

  const handleFormSubmit = (formData: AssetFormData) => {
    let result

    if (editingIndex >= 0) {
      result = updateAsset(editingIndex, formData)
      if (result.isValid) {
        showToast("Aset berhasil diperbarui")
        cancelEdit()
      }
    } else {
      result = addAsset(formData)
      if (result.isValid) {
        showToast("Aset berhasil ditambahkan")
      }
    }

    if (!result.isValid) {
      alert("Error:\n" + result.errors.join("\n"))
    }
  }

  const handleEdit = (index: number) => {
    startEdit(index)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = (index: number) => {
    const deletedAsset = assets[index]
    deleteAsset(index)
    showToast(`Aset "${deletedAsset.assetNumber}" berhasil dihapus`)
  }

  const handleBulkDelete = (assetIds: string[]) => {
    const assetsToDelete = assets.filter((asset) => assetIds.includes(asset.id))
    const newAssets = assets.filter((asset) => !assetIds.includes(asset.id))
    setAssets(newAssets)
    showToast(`${assetsToDelete.length} aset berhasil dihapus`)
  }

  const handleImport = (importedAssets: any[]) => {
    setAssets((prev) => [...prev, ...importedAssets])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Trakindo/CAT styling */}
      <header className="bg-trakindo shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo Trakindo CAT */}
            <div className="flex items-center">
              <img src="/images/trakindo-logo.png" alt="Trakindo CAT Logo" className="h-12 w-auto" />
            </div>

            {/* Title */}
            <div className="text-center flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-cat-black">📦 Asset Management System</h1>
              <p className="text-cat-black/80 text-sm">Sistem Manajemen Aset Terpadu</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Asset Form */}
        <AssetForm
          onSubmit={handleFormSubmit}
          onCancel={editingIndex >= 0 ? cancelEdit : undefined}
          initialData={editingIndex >= 0 ? assets[editingIndex] : undefined}
          isEditing={editingIndex >= 0}
          onToast={showToast}
        />

        {/* Export/Import */}
        <ExportImport assets={assets} onImport={handleImport} onToast={showToast} />

        {/* Advanced Asset Table */}
        <AdvancedAssetTable
          assets={assets}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      {/* Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
