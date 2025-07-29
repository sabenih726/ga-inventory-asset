"use client"

import { useState, useCallback } from "react"
import type { Asset, AssetFormData, ValidationResult } from "@/types/asset"
import { useLocalStorage } from "./useLocalStorage"
import { validateAssetForm } from "@/utils/validation"

export function useAssets() {
  const [assets, setAssets, isLoading] = useLocalStorage<Asset[]>("assets", [])
  const [editingIndex, setEditingIndex] = useState<number>(-1)

  // Ensure assets is always an array
  const safeAssets = Array.isArray(assets) ? assets : []

  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }, [])

  const addAsset = useCallback(
    (assetData: AssetFormData): ValidationResult => {
      const validation = validateAssetForm(assetData, safeAssets, -1)

      if (!validation.isValid) {
        return validation
      }

      const newAsset: Asset = {
        id: generateId(),
        assetNumber: assetData.assetNumber.trim(),
        assetDescription: assetData.assetDescription.trim(),
        assetLocation: assetData.assetLocation.trim(),
        costCenter: assetData.costCenter.trim(),
        status: assetData.status,
        condition: assetData.condition,
        createdAt: new Date().toISOString(),
      }

      setAssets((prev) => {
        const prevArray = Array.isArray(prev) ? prev : []
        return [...prevArray, newAsset]
      })
      return { isValid: true, errors: [] }
    },
    [safeAssets, setAssets, generateId],
  )

  const updateAsset = useCallback(
    (index: number, assetData: AssetFormData): ValidationResult => {
      const validation = validateAssetForm(assetData, safeAssets, index)

      if (!validation.isValid) {
        return validation
      }

      setAssets((prev) => {
        const prevArray = Array.isArray(prev) ? prev : []
        return prevArray.map((asset, i) =>
          i === index
            ? {
                ...asset,
                assetNumber: assetData.assetNumber.trim(),
                assetDescription: assetData.assetDescription.trim(),
                assetLocation: assetData.assetLocation.trim(),
                costCenter: assetData.costCenter.trim(),
                status: assetData.status,
                condition: assetData.condition,
                updatedAt: new Date().toISOString(),
              }
            : asset,
        )
      })

      return { isValid: true, errors: [] }
    },
    [safeAssets, setAssets],
  )

  const deleteAsset = useCallback(
    (index: number) => {
      setAssets((prev) => {
        const prevArray = Array.isArray(prev) ? prev : []
        return prevArray.filter((_, i) => i !== index)
      })
    },
    [setAssets],
  )

  const startEdit = useCallback((index: number) => {
    setEditingIndex(index)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingIndex(-1)
  }, [])

  return {
    assets: safeAssets,
    setAssets,
    isLoading,
    editingIndex,
    addAsset,
    updateAsset,
    deleteAsset,
    startEdit,
    cancelEdit,
  }
}
