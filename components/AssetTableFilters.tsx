"use client"
import type { FilterConfig } from "@/types/table"
import { ASSET_STATUS_OPTIONS, ASSET_CONDITION_OPTIONS } from "@/types/asset"

interface AssetTableFiltersProps {
  filterConfig: FilterConfig
  onFilterChange: (config: FilterConfig) => void
  uniqueLocations: string[]
  uniqueCostCenters: string[]
  uniqueStatuses: string[]
  uniqueConditions: string[]
  totalAssets: number
  filteredCount: number
}

export default function AssetTableFilters({
  filterConfig,
  onFilterChange,
  uniqueLocations,
  uniqueCostCenters,
  uniqueStatuses,
  uniqueConditions,
  totalAssets,
  filteredCount,
}: AssetTableFiltersProps) {
  const handleFilterChange = (field: keyof FilterConfig, value: string) => {
    onFilterChange({
      ...filterConfig,
      [field]: value,
    })
  }

  const clearFilters = () => {
    onFilterChange({
      search: "",
      location: "",
      costCenter: "",
      status: "",
      condition: "",
      dateFrom: "",
      dateTo: "",
    })
  }

  const hasActiveFilters = Object.values(filterConfig).some((value) => value !== "")

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">
            🔍 Pencarian
          </label>
          <input
            type="text"
            id="search"
            placeholder="Cari nomor aset, deskripsi, atau lokasi..."
            value={filterConfig.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="trakindo-input w-full"
          />
        </div>

        {/* Location Filter */}
        <div className="w-full lg:w-48">
          <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
            📍 Lokasi
          </label>
          <select
            id="location"
            value={filterConfig.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="trakindo-input w-full"
          >
            <option value="">Semua Lokasi</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Cost Center Filter */}
        <div className="w-full lg:w-48">
          <label htmlFor="costCenter" className="block text-sm font-medium text-foreground mb-1">
            💼 Cost Center
          </label>
          <select
            id="costCenter"
            value={filterConfig.costCenter}
            onChange={(e) => handleFilterChange("costCenter", e.target.value)}
            className="trakindo-input w-full"
          >
            <option value="">Semua Cost Center</option>
            {uniqueCostCenters.map((costCenter) => (
              <option key={costCenter} value={costCenter}>
                {costCenter}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-40">
          <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
            📊 Status
          </label>
          <select
            id="status"
            value={filterConfig.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="trakindo-input w-full"
          >
            <option value="">Semua Status</option>
            {ASSET_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div className="w-full lg:w-40">
          <label htmlFor="condition" className="block text-sm font-medium text-foreground mb-1">
            🔧 Kondisi
          </label>
          <select
            id="condition"
            value={filterConfig.condition}
            onChange={(e) => handleFilterChange("condition", e.target.value)}
            className="trakindo-input w-full"
          >
            <option value="">Semua Kondisi</option>
            {ASSET_CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="w-full lg:w-40">
          <label htmlFor="dateFrom" className="block text-sm font-medium text-foreground mb-1">
            📅 Dari Tanggal
          </label>
          <input
            type="date"
            id="dateFrom"
            value={filterConfig.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            className="trakindo-input w-full"
          />
        </div>

        {/* Date To */}
        <div className="w-full lg:w-40">
          <label htmlFor="dateTo" className="block text-sm font-medium text-foreground mb-1">
            📅 Sampai Tanggal
          </label>
          <input
            type="date"
            id="dateTo"
            value={filterConfig.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            className="trakindo-input w-full"
          />
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="trakindo-button-secondary px-4 py-2 h-10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            🗑️ Reset Filter
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-3 flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Menampilkan {filteredCount} dari {totalAssets} aset
          {hasActiveFilters && <span className="text-primary font-medium"> (terfilter)</span>}
        </span>
        {hasActiveFilters && (
          <span className="text-primary">
            Filter aktif: {Object.entries(filterConfig).filter(([_, value]) => value !== "").length}
          </span>
        )}
      </div>
    </div>
  )
}
