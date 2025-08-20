"use client"

import type { Asset } from "@/types/asset"
import type { SortField } from "@/types"
import { useAssetTable } from "@/hooks/useAssetTable"
import AssetTableFilters from "./AssetTableFilters"
import ValidationPanel from "./ValidationPanel"
import { ASSET_CONDITION_OPTIONS } from "@/types/asset"

interface AdvancedAssetTableProps {
  assets: Asset[]
  onEdit: (index: number) => void
  onDelete: (index: number) => void
  onBulkDelete?: (assetIds: string[]) => void
}

export default function AdvancedAssetTable({ assets, onEdit, onDelete, onBulkDelete }: AdvancedAssetTableProps) {
  const {
    processedAssets,
    sortConfig,
    filterConfig,
    selectedAssets,
    validationIssues,
    uniqueLocations,
    uniqueCostCenters,
    uniqueConditions,
    handleSort,
    setFilterConfig,
    toggleAssetSelection,
    toggleAllSelection,
    clearSelection,
  } = useAssetTable(assets)

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return "↕️"
    return sortConfig.direction === "asc" ? "⬆️" : "⬇️"
  }

  const handleEdit = (assetId: string) => {
    const index = assets.findIndex((asset) => asset.id === assetId)
    if (index !== -1) onEdit(index)
  }

  const handleDelete = (assetId: string) => {
    const index = assets.findIndex((asset) => asset.id === assetId)
    if (index !== -1) {
      const asset = assets[index]
      if (confirm(`Apakah Anda yakin ingin menghapus aset "${asset.assetNumber}"?`)) {
        onDelete(index)
      }
    }
  }

  const handleBulkDelete = () => {
    if (selectedAssets.size === 0) return

    const selectedAssetNumbers = Array.from(selectedAssets)
      .map((id) => assets.find((asset) => asset.id === id)?.assetNumber)
      .filter(Boolean)

    if (
      confirm(
        `Apakah Anda yakin ingin menghapus ${selectedAssets.size} aset yang dipilih?\n\n${selectedAssetNumbers.slice(0, 5).join(", ")}${selectedAssetNumbers.length > 5 ? "..." : ""}`,
      )
    ) {
      if (onBulkDelete) {
        onBulkDelete(Array.from(selectedAssets))
      }
      clearSelection()
    }
  }

  const getValidationStatus = (assetId: string) => {
    const assetIssues = validationIssues.filter((issue) => issue.id === assetId)
    if (assetIssues.length === 0) return null

    const hasError = assetIssues.some((issue) => issue.severity === "error")
    return hasError ? "error" : "warning"
  }

  const getConditionDisplay = (condition: string) => {
    const option = ASSET_CONDITION_OPTIONS.find((opt) => opt.value === condition)
    return option ? option.label : condition
  }

  const getConditionColor = (condition: string) => {
    const option = ASSET_CONDITION_OPTIONS.find((opt) => opt.value === condition)
    return option ? option.color : "gray"
  }

  if (assets.length === 0) {
    return (
      <div className="trakindo-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">📋 Data Aset</h2>
          <p className="text-sm text-muted-foreground mt-1">Total: 0 aset</p>
        </div>
        <div className="text-center py-12">
          <div className="text-muted-foreground text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Belum ada data aset</h3>
          <p className="text-muted-foreground">Mulai dengan menambahkan aset pertama Anda</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Validation Panel */}
      <ValidationPanel issues={validationIssues} onFixIssue={handleEdit} />

      {/* Table Container */}
      <div className="trakindo-card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-foreground">📋 Data Aset</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Total: {assets.length} aset
                {selectedAssets.size > 0 && <span className="text-primary ml-2">({selectedAssets.size} dipilih)</span>}
              </p>
            </div>

            {/* Bulk Actions */}
            {selectedAssets.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive"
                >
                  🗑️ Hapus ({selectedAssets.size})
                </button>
                <button onClick={clearSelection} className="trakindo-button-secondary px-4 py-2 h-10">
                  ❌ Batal Pilih
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <AssetTableFilters
          filterConfig={filterConfig}
          onFilterChange={setFilterConfig}
          uniqueLocations={uniqueLocations}
          uniqueCostCenters={uniqueCostCenters}
          uniqueConditions={uniqueConditions}
          totalAssets={assets.length}
          filteredCount={processedAssets.length}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssets.size === processedAssets.length && processedAssets.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent"
                  onClick={() => handleSort("assetNumber")}
                >
                  <div className="flex items-center">Nomor Aset {getSortIcon("assetNumber")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent"
                  onClick={() => handleSort("assetDescription")}
                >
                  <div className="flex items-center">Deskripsi {getSortIcon("assetDescription")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent"
                  onClick={() => handleSort("assetLocation")}
                >
                  <div className="flex items-center">Lokasi {getSortIcon("assetLocation")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent"
                  onClick={() => handleSort("costCenter")}
                >
                  <div className="flex items-center">Cost Center {getSortIcon("costCenter")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent"
                  onClick={() => handleSort("condition")}
                >
                  <div className="flex items-center">Kondisi {getSortIcon("condition")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">Tanggal Input {getSortIcon("createdAt")}</div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {processedAssets.map((asset) => {
                const validationStatus = getValidationStatus(asset.id)
                return (
                  <tr
                    key={asset.id}
                    className={`hover:bg-muted/50 ${selectedAssets.has(asset.id) ? "bg-primary/10" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAssets.has(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {validationStatus === "error" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                          ❌ Error
                        </span>
                      )}
                      {validationStatus === "warning" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-chart-4/10 text-chart-4">
                          ⚠️ Warning
                        </span>
                      )}
                      {!validationStatus && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-chart-1/10 text-chart-1">
                          ✅ Valid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{asset.assetNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground max-w-xs truncate" title={asset.assetDescription}>
                        {asset.assetDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{asset.assetLocation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{asset.costCenter}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getConditionColor(asset.condition) === "green"
                            ? "bg-chart-1/10 text-chart-1"
                            : getConditionColor(asset.condition) === "red"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-chart-4/10 text-chart-4"
                        }`}
                      >
                        {getConditionDisplay(asset.condition)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{formatDate(asset.createdAt)}</div>
                      {asset.updatedAt && (
                        <div className="text-xs text-primary">Diperbarui: {formatDate(asset.updatedAt)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(asset.id)}
                        className="text-primary hover:text-primary/80 mr-3"
                        title="Edit aset"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="text-destructive hover:text-destructive/80"
                        title="Hapus aset"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State for Filtered Results */}
        {processedAssets.length === 0 && assets.length > 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-foreground mb-2">Tidak ada hasil yang ditemukan</h3>
            <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian</p>
            <button
              onClick={() =>
                setFilterConfig({
                  search: "",
                  location: "",
                  costCenter: "",
                  condition: "",
                  dateFrom: "",
                  dateTo: "",
                })
              }
              className="mt-4 trakindo-button-primary px-4 py-2 h-10"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
