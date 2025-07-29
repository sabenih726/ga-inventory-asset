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
