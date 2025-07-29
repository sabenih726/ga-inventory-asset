export type SortDirection = "asc" | "desc" | null
export type SortField =
  | "assetNumber"
  | "assetDescription"
  | "assetLocation"
  | "costCenter"
  | "status"
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
  status: string
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
  status: AssetStatus
  condition: AssetCondition
  createdAt: string
  updatedAt?: string
}

export type AssetStatus = "active" | "inactive" | "maintenance" | "disposed"
export type AssetCondition = "excellent" | "good" | "fair" | "poor" | "damaged"
