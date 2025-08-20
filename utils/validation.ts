import type { AssetFormData, ValidationResult, Asset } from "@/types/asset"

export function validateAssetForm(
  formData: AssetFormData,
  existingAssets: Asset[],
  editingIndex: number,
): ValidationResult {
  const errors: string[] = []

  // Validasi nomor aset
  if (!formData.assetNumber.trim()) {
    errors.push("Nomor aset harus diisi")
  } else if (formData.assetNumber.trim().length < 3) {
    errors.push("Nomor aset minimal 3 karakter")
  }

  // Validasi deskripsi
  if (!formData.assetDescription.trim()) {
    errors.push("Deskripsi aset harus diisi")
  } else if (formData.assetDescription.trim().length < 5) {
    errors.push("Deskripsi aset minimal 5 karakter")
  }

  // Validasi lokasi
  if (!formData.assetLocation.trim()) {
    errors.push("Lokasi aset harus diisi")
  }

  // Validasi cost center
  if (!formData.costCenter.trim()) {
    errors.push("Cost Center harus diisi")
  } else if (formData.costCenter.trim().length < 3) {
    errors.push("Cost Center minimal 3 karakter")
  }

  // Validasi condition
  if (!formData.condition) {
    errors.push("Kondisi aset harus dipilih")
  }

  // Cek duplikasi nomor aset (kecuali saat edit)
  const isDuplicate = existingAssets.some(
    (asset, index) =>
      asset.assetNumber.toLowerCase() === formData.assetNumber.trim().toLowerCase() && index !== editingIndex,
  )

  if (isDuplicate) {
    errors.push("Nomor aset sudah ada")
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  }
}
