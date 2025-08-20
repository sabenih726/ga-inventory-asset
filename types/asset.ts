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

export interface AssetFormData {
  assetNumber: string
  assetDescription: string
  assetLocation: string
  costCenter: string
  condition: AssetCondition
}

export type AssetCondition = "bagus" | "rusak" | "perbaikan"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ToastMessage {
  message: string
  type: "success" | "error" | "info"
}

// Constants for dropdown options
export const ASSET_CONDITION_OPTIONS = [
  { value: "bagus", label: "✅ Bagus", color: "green" },
  { value: "rusak", label: "❌ Rusak", color: "red" },
  { value: "perbaikan", label: "🔧 Perbaikan", color: "yellow" },
] as const
