export type SortDirection = "asc" | "desc" | null
export type SortField =
  | "assetNumber"
  | "assetDescription"
  | "assetLocation"
  | "costCenter"
  | "condition"
  | "createdAt"
  | "updatedAt"

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export interface FilterConfig {
  search: string
  location: string
  costCenter: string
  condition: string
  dateFrom: string
  dateTo: string
}

export interface ValidationIssue {
  id: string
  assetNumber: string
  issue: string
  severity: "error" | "warning"
}

export interface Asset {
  id: string
  assetNumber: string
  assetDescription: string
  assetLocation: string
  costCenter: string
  condition: AssetCondition
  createdAt: string
  updatedAt?: string
}

export type AssetCondition = "bagus" | "rusak" | "perbaikan"
