"use client"

import type { Asset } from "@/types/asset"
import type { SortField } from "@/types/table"
import { useAssetTable } from "@/hooks/useAssetTable"
import AssetTableFilters from "./AssetTableFilters"
import ValidationPanel from "./ValidationPanel"
import { ASSET_STATUS_OPTIONS, ASSET_CONDITION_OPTIONS } from "@/types/asset"

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
    uniqueStatuses,
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

  const getStatusDisplay = (status: string) => {
    const option = ASSET_STATUS_OPTIONS.find((opt) => opt.value === status)
    return option ? option.label : status
  }

  const getConditionDisplay = (condition: string) => {
    const option = ASSET_CONDITION_OPTIONS.find((opt) => opt.value === condition)
    return option ? option.label : condition
  }

  const getStatusColor = (status: string) => {
    const option = ASSET_STATUS_OPTIONS.find((opt) => opt.value === status)
    return option ? option.color : "gray"
  }

  const getConditionColor = (condition: string) => {
    const option = ASSET_CONDITION_OPTIONS.find((opt) => opt.value === condition)
    return option ? option.color : "gray"
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">📋 Data Aset</h2>
          <p className="text-sm text-gray-600 mt-1">Total: 0 aset</p>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data aset</h3>
          <p className="text-gray-500">Mulai dengan menambahkan aset pertama Anda</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Validation Panel */}
      <ValidationPanel issues={validationIssues} onFixIssue={handleEdit} />

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">📋 Data Aset</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {assets.length} aset
                {selectedAssets.size > 0 && <span className="text-blue-600 ml-2">({selectedAssets.size} dipilih)</span>}
              </p>
            </div>

            {/* Bulk Actions */}
            {selectedAssets.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  🗑️ Hapus ({selectedAssets.size})
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
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
          uniqueStatuses={uniqueStatuses}
          uniqueConditions={uniqueConditions}
          totalAssets={assets.length}
          filteredCount={processedAssets.length}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssets.size === processedAssets.length && processedAssets.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("assetNumber")}
                >
                  <div className="flex items-center">Nomor Aset {getSortIcon("assetNumber")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("assetDescription")}
                >
                  <div className="flex items-center">Deskripsi {getSortIcon("assetDescription")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("assetLocation")}
                >
                  <div className="flex items-center">Lokasi {getSortIcon("assetLocation")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("costCenter")}
                >
                  <div className="flex items-center">Cost Center {getSortIcon("costCenter")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">Status {getSortIcon("status")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("condition")}
                >
                  <div className="flex items-center">Kondisi {getSortIcon("condition")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">Tanggal Input {getSortIcon("createdAt")}</div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedAssets.map((asset) => {
                const validationStatus = getValidationStatus(asset.id)
                return (
                  <tr key={asset.id} className={`hover:bg-gray-50 ${selectedAssets.has(asset.id) ? "bg-blue-50" : ""}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAssets.has(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {validationStatus === "error" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ❌ Error
                        </span>
                      )}
                      {validationStatus === "warning" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠️ Warning
                        </span>
                      )}
                      {!validationStatus && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Valid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{asset.assetNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={asset.assetDescription}>
                        {asset.assetDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.assetLocation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.costCenter}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(asset.status)}-100 text-${getStatusColor(asset.status)}-800`}
                      >
                        {getStatusDisplay(asset.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getConditionColor(asset.condition)}-100 text-${getConditionColor(asset.condition)}-800`}
                      >
                        {getConditionDisplay(asset.condition)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(asset.createdAt)}</div>
                      {asset.updatedAt && (
                        <div className="text-xs text-blue-500">Diperbarui: {formatDate(asset.updatedAt)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(asset.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit aset"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="text-red-600 hover:text-red-900"
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
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada hasil yang ditemukan</h3>
            <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
            <button
              onClick={() =>
                setFilterConfig({
                  search: "",
                  location: "",
                  costCenter: "",
                  status: "",
                  condition: "",
                  dateFrom: "",
                  dateTo: "",
                })
              }
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
