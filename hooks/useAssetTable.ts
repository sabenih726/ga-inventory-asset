"use client"

import { useMemo, useState } from "react"
import type { Asset, SortConfig, FilterConfig, SortField, ValidationIssue } from "@/types" // Assuming these types are declared in a separate file

export function useAssetTable(assets: Asset[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "createdAt", direction: "desc" })
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    search: "",
    location: "",
    costCenter: "",
    status: "",
    condition: "",
    dateFrom: "",
    dateTo: "",
  })
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())

  // Ensure assets is always an array
  const safeAssets = assets || []

  // Sorting function
  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Filter and sort assets
  const processedAssets = useMemo(() => {
    if (!safeAssets || safeAssets.length === 0) {
      return []
    }

    const filtered = safeAssets.filter((asset) => {
      if (!asset) return false

      // Search filter
      if (filterConfig.search) {
        const searchTerm = filterConfig.search.toLowerCase()
        const searchableText =
          `${asset.assetNumber || ""} ${asset.assetDescription || ""} ${asset.assetLocation || ""}`.toLowerCase()
        if (!searchableText.includes(searchTerm)) return false
      }

      // Location filter
      if (
        filterConfig.location &&
        asset.assetLocation &&
        !asset.assetLocation.toLowerCase().includes(filterConfig.location.toLowerCase())
      ) {
        return false
      }

      // Cost Center filter
      if (
        filterConfig.costCenter &&
        asset.costCenter &&
        !asset.costCenter.toLowerCase().includes(filterConfig.costCenter.toLowerCase())
      ) {
        return false
      }

      // Status filter
      if (filterConfig.status && asset.status !== filterConfig.status) {
        return false
      }

      // Condition filter
      if (filterConfig.condition && asset.condition !== filterConfig.condition) {
        return false
      }

      // Date range filter
      if (filterConfig.dateFrom && asset.createdAt) {
        const assetDate = new Date(asset.createdAt)
        const fromDate = new Date(filterConfig.dateFrom)
        if (assetDate < fromDate) return false
      }

      if (filterConfig.dateTo && asset.createdAt) {
        const assetDate = new Date(asset.createdAt)
        const toDate = new Date(filterConfig.dateTo)
        toDate.setHours(23, 59, 59, 999) // End of day
        if (assetDate > toDate) return false
      }

      return true
    })

    // Sort filtered results
    if (sortConfig.direction && filtered.length > 0) {
      filtered.sort((a, b) => {
        if (!a || !b) return 0

        let aValue: any = a[sortConfig.field]
        let bValue: any = b[sortConfig.field]

        // Handle date fields
        if (sortConfig.field === "createdAt" || sortConfig.field === "updatedAt") {
          aValue = new Date(aValue || 0).getTime()
          bValue = new Date(bValue || 0).getTime()
        } else {
          // Handle string fields
          aValue = aValue?.toString().toLowerCase() || ""
          bValue = bValue?.toString().toLowerCase() || ""
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [safeAssets, sortConfig, filterConfig])

  // Validation function
  const validationIssues = useMemo(() => {
    const issues: ValidationIssue[] = []
    const assetNumbers = new Set<string>()

    if (!safeAssets || safeAssets.length === 0) {
      return issues
    }

    safeAssets.forEach((asset) => {
      if (!asset || !asset.id || !asset.assetNumber) return

      // Check for duplicates
      if (assetNumbers.has(asset.assetNumber.toLowerCase())) {
        issues.push({
          id: asset.id,
          assetNumber: asset.assetNumber,
          issue: "Nomor aset duplikat",
          severity: "error",
        })
      } else {
        assetNumbers.add(asset.assetNumber.toLowerCase())
      }

      // Check for short descriptions
      if (!asset.assetDescription || asset.assetDescription.length < 10) {
        issues.push({
          id: asset.id,
          assetNumber: asset.assetNumber,
          issue: "Deskripsi terlalu pendek (minimal 10 karakter)",
          severity: "warning",
        })
      }

      // Check for missing location details
      if (!asset.assetLocation || asset.assetLocation.length < 5) {
        issues.push({
          id: asset.id,
          assetNumber: asset.assetNumber,
          issue: "Lokasi kurang detail (minimal 5 karakter)",
          severity: "warning",
        })
      }

      // Check for missing cost center
      if (!asset.costCenter || asset.costCenter.length < 3) {
        issues.push({
          id: asset.id,
          assetNumber: asset.assetNumber,
          issue: "Cost Center kurang detail (minimal 3 karakter)",
          severity: "warning",
        })
      }

      // Check for inactive assets with good condition
      if (asset.status === "inactive" && (asset.condition === "excellent" || asset.condition === "good")) {
        issues.push({
          id: asset.id,
          assetNumber: asset.assetNumber,
          issue: "Aset tidak aktif tapi kondisi masih baik",
          severity: "warning",
        })
      }

      // Check for active assets with poor condition
      if (asset.status === "active" && (asset.condition === "poor" || asset.condition === "damaged")) {
        issues.push({
          id: asset.id,
          assetNumber: asset.assetNumber,
          issue: "Aset aktif dengan kondisi buruk perlu perhatian",
          severity: "error",
        })
      }

      // Check for old assets without updates
      if (asset.createdAt) {
        const daysSinceCreated = Math.floor(
          (new Date().getTime() - new Date(asset.createdAt).getTime()) / (1000 * 60 * 60 * 24),
        )
        if (daysSinceCreated > 30 && !asset.updatedAt) {
          issues.push({
            id: asset.id,
            assetNumber: asset.assetNumber,
            issue: "Aset lama belum pernah diupdate (>30 hari)",
            severity: "warning",
          })
        }
      }
    })

    return issues
  }, [safeAssets])

  // Selection functions
  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(assetId)) {
        newSet.delete(assetId)
      } else {
        newSet.add(assetId)
      }
      return newSet
    })
  }

  const toggleAllSelection = () => {
    if (selectedAssets.size === processedAssets.length) {
      setSelectedAssets(new Set())
    } else {
      setSelectedAssets(new Set(processedAssets.map((asset) => asset.id)))
    }
  }

  const clearSelection = () => {
    setSelectedAssets(new Set())
  }

  // Get unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    if (!safeAssets || safeAssets.length === 0) return []
    const locations = safeAssets.filter((asset) => asset && asset.assetLocation).map((asset) => asset.assetLocation)
    return Array.from(new Set(locations)).sort()
  }, [safeAssets])

  // Get unique cost centers for filter dropdown
  const uniqueCostCenters = useMemo(() => {
    if (!safeAssets || safeAssets.length === 0) return []
    const costCenters = safeAssets.filter((asset) => asset && asset.costCenter).map((asset) => asset.costCenter)
    return Array.from(new Set(costCenters)).sort()
  }, [safeAssets])

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    if (!safeAssets || safeAssets.length === 0) return []
    const statuses = safeAssets.filter((asset) => asset && asset.status).map((asset) => asset.status)
    return Array.from(new Set(statuses)).sort()
  }, [safeAssets])

  // Get unique conditions for filter dropdown
  const uniqueConditions = useMemo(() => {
    if (!safeAssets || safeAssets.length === 0) return []
    const conditions = safeAssets.filter((asset) => asset && asset.condition).map((asset) => asset.condition)
    return Array.from(new Set(conditions)).sort()
  }, [safeAssets])

  return {
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
  }
}
