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

export interface AssetFormData {
  assetNumber: string
  assetDescription: string
  assetLocation: string
  costCenter: string
  status: AssetStatus
  condition: AssetCondition
}

export type AssetStatus = "active" | "inactive" | "maintenance" | "disposed"
export type AssetCondition = "excellent" | "good" | "fair" | "poor" | "damaged"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ToastMessage {
  message: string
  type: "success" | "error" | "info"
}

// Constants for dropdown options
export const ASSET_STATUS_OPTIONS = [
  { value: "active", label: "🟢 Aktif", color: "green" },
  { value: "inactive", label: "🔴 Tidak Aktif", color: "red" },
  { value: "maintenance", label: "🟡 Maintenance", color: "yellow" },
  { value: "disposed", label: "⚫ Disposed", color: "gray" },
] as const

export const ASSET_CONDITION_OPTIONS = [
  { value: "excellent", label: "⭐ Excellent", color: "green" },
  { value: "good", label: "✅ Good", color: "blue" },
  { value: "fair", label: "⚠️ Fair", color: "yellow" },
  { value: "poor", label: "❌ Poor", color: "orange" },
  { value: "damaged", label: "💥 Damaged", color: "red" },
] as const
