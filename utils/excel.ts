import * as XLSX from "xlsx"
import type { Asset } from "@/types/asset"

export function exportToExcel(assets: Asset[]): void {
  if (assets.length === 0) {
    throw new Error("Tidak ada data untuk diekspor")
  }

  try {
    // Format data untuk export dengan header yang jelas
    const exportData = assets.map((asset, index) => ({
      No: index + 1,
      "Nomor Aset": asset.assetNumber,
      "Deskripsi Aset": asset.assetDescription,
      "Lokasi Aset": asset.assetLocation,
      "Cost Center": asset.costCenter,
      Kondisi: getConditionLabel(asset.condition),
      "Tanggal Input": formatDateForExcel(asset.createdAt),
      "Tanggal Update": asset.updatedAt ? formatDateForExcel(asset.updatedAt) : "-",
    }))

    // Buat workbook dan worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set lebar kolom yang optimal
    const colWidths = [
      { wch: 5 }, // No
      { wch: 20 }, // Nomor Aset
      { wch: 40 }, // Deskripsi Aset
      { wch: 25 }, // Lokasi Aset
      { wch: 15 }, // Cost Center
      { wch: 15 }, // Kondisi
      { wch: 20 }, // Tanggal Input
      { wch: 20 }, // Tanggal Update
    ]
    ws["!cols"] = colWidths

    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, "Data Aset")

    // Generate nama file dengan timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const filename = `data-aset-${timestamp}.xlsx`

    // Export menggunakan browser download - perbaikan untuk browser compatibility
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.style.display = "none"

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error in exportToExcel:", error)
    throw new Error("Gagal mengekspor data ke Excel")
  }
}

export function importFromExcel(file: File): Promise<Asset[]> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("File tidak ditemukan"))
      return
    }

    // Validasi tipe file
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ]

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      reject(new Error("Format file tidak didukung. Gunakan file .xlsx atau .xls"))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        if (workbook.SheetNames.length === 0) {
          reject(new Error("File Excel tidak memiliki worksheet"))
          return
        }

        // Ambil worksheet pertama
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert ke JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // Gunakan array untuk mendapatkan raw data
          defval: "", // Default value untuk cell kosong
        }) as any[][]

        if (jsonData.length === 0) {
          reject(new Error("File Excel kosong"))
          return
        }

        // Cari header row (biasanya baris pertama yang tidak kosong)
        let headerRowIndex = -1
        let headers: string[] = []

        for (let i = 0; i < Math.min(5, jsonData.length); i++) {
          const row = jsonData[i]
          if (row && row.length > 0 && row.some((cell) => cell && cell.toString().trim())) {
            // Cek apakah ini header row dengan mencari kata kunci
            const rowStr = row.join(" ").toLowerCase()
            if (rowStr.includes("nomor") || rowStr.includes("aset") || rowStr.includes("deskripsi")) {
              headerRowIndex = i
              headers = row.map((cell) => (cell ? cell.toString().trim() : ""))
              break
            }
          }
        }

        if (headerRowIndex === -1) {
          reject(new Error("Header tidak ditemukan. Pastikan file memiliki header yang sesuai"))
          return
        }

        // Proses data mulai dari baris setelah header
        const dataRows = jsonData.slice(headerRowIndex + 1)
        const importedAssets: Asset[] = []
        const errors: string[] = []

        // Mapping kolom yang fleksibel
        const findColumnIndex = (searchTerms: string[]): number => {
          for (const term of searchTerms) {
            const index = headers.findIndex((header) => header.toLowerCase().includes(term.toLowerCase()))
            if (index !== -1) return index
          }
          return -1
        }

        const assetNumberCol = findColumnIndex(["nomor aset", "nomor_aset", "asset_number", "asset number", "no aset"])
        const descriptionCol = findColumnIndex(["deskripsi", "description", "desc", "keterangan"])
        const locationCol = findColumnIndex(["lokasi", "location", "tempat"])
        const costCenterCol = findColumnIndex(["cost center", "cost_center", "costcenter", "cc"])
        const conditionCol = findColumnIndex(["kondisi", "condition", "cond"])

        if (assetNumberCol === -1 || descriptionCol === -1 || locationCol === -1) {
          reject(
            new Error(`Kolom yang diperlukan tidak ditemukan. Pastikan file memiliki kolom:
- Nomor Aset
- Deskripsi Aset  
- Lokasi Aset

Header yang ditemukan: ${headers.join(", ")}`),
          )
          return
        }

        dataRows.forEach((row, index) => {
          const rowNum = headerRowIndex + index + 2 // +2 karena index mulai dari 0 dan header

          if (!row || row.length === 0 || !row.some((cell) => cell && cell.toString().trim())) {
            // Skip baris kosong
            return
          }

          const assetNumber = row[assetNumberCol] ? row[assetNumberCol].toString().trim() : ""
          const assetDescription = row[descriptionCol] ? row[descriptionCol].toString().trim() : ""
          const assetLocation = row[locationCol] ? row[locationCol].toString().trim() : ""
          const costCenter = row[costCenterCol] ? row[costCenterCol].toString().trim() : ""
          const condition = row[conditionCol] ? normalizeCondition(row[conditionCol].toString().trim()) : "bagus"

          // Validasi data
          if (!assetNumber) {
            errors.push(`Baris ${rowNum}: Nomor aset kosong`)
            return
          }

          if (!assetDescription) {
            errors.push(`Baris ${rowNum}: Deskripsi aset kosong`)
            return
          }

          if (!assetLocation) {
            errors.push(`Baris ${rowNum}: Lokasi aset kosong`)
            return
          }

          if (!costCenter) {
            errors.push(`Baris ${rowNum}: Cost Center kosong`)
            return
          }

          // Cek duplikasi dalam data yang diimpor
          const isDuplicate = importedAssets.some(
            (asset) => asset.assetNumber.toLowerCase() === assetNumber.toLowerCase(),
          )

          if (isDuplicate) {
            errors.push(`Baris ${rowNum}: Nomor aset "${assetNumber}" duplikat dalam file`)
            return
          }

          // Tambahkan ke array hasil
          importedAssets.push({
            id: generateImportId(),
            assetNumber: assetNumber,
            assetDescription: assetDescription,
            assetLocation: assetLocation,
            costCenter: costCenter,
            condition: condition as any,
            createdAt: new Date().toISOString(),
          })
        })

        // Cek apakah ada error
        if (errors.length > 0) {
          reject(
            new Error(
              `Terdapat ${errors.length} error dalam file:\n\n${errors.slice(0, 10).join("\n")}${errors.length > 10 ? `\n... dan ${errors.length - 10} error lainnya` : ""}`,
            ),
          )
          return
        }

        if (importedAssets.length === 0) {
          reject(new Error("Tidak ada data valid untuk diimpor"))
          return
        }

        resolve(importedAssets)
      } catch (error) {
        console.error("Error in importFromExcel:", error)
        reject(new Error("Gagal membaca file Excel. Pastikan file tidak rusak dan format sesuai"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Gagal membaca file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Helper functions
function formatDateForExcel(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  } catch (error) {
    return dateString
  }
}

function generateImportId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function getConditionLabel(condition: string): string {
  const conditionMap: Record<string, string> = {
    bagus: "Bagus",
    rusak: "Rusak",
    perbaikan: "Perbaikan",
  }
  return conditionMap[condition] || condition
}

function normalizeCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    bagus: "bagus",
    baik: "bagus",
    good: "bagus",
    rusak: "rusak",
    damaged: "rusak",
    broken: "rusak",
    perbaikan: "perbaikan",
    repair: "perbaikan",
    maintenance: "perbaikan",
  }
  return conditionMap[condition.toLowerCase()] || "bagus"
}

// Fungsi untuk membuat template Excel - diperbaiki untuk browser
export function downloadTemplate(): void {
  const templateData = [
    {
      "Nomor Aset": "AST001",
      "Deskripsi Aset": "Meja Kerja Staff dengan laci 3 tingkat",
      "Lokasi Aset": "Ruang Meeting Lt. 5",
      "Cost Center": "CC-001",
      Kondisi: "Bagus",
    },
    {
      "Nomor Aset": "AST002",
      "Deskripsi Aset": "Kursi Kantor Ergonomis dengan roda",
      "Lokasi Aset": "Ruang Staff Lt. 3",
      "Cost Center": "HR-001",
      Kondisi: "Bagus",
    },
    {
      "Nomor Aset": "AST003",
      "Deskripsi Aset": "Laptop Dell Inspiron 15 inch",
      "Lokasi Aset": "IT Department",
      "Cost Center": "IT-001",
      Kondisi: "Perbaikan",
    },
  ]

  try {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(templateData)

    // Set lebar kolom
    const colWidths = [
      { wch: 20 }, // Nomor Aset
      { wch: 40 }, // Deskripsi Aset
      { wch: 25 }, // Lokasi Aset
      { wch: 15 }, // Cost Center
      { wch: 15 }, // Kondisi
    ]
    ws["!cols"] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, "Template Data Aset")

    // Export template menggunakan browser download
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "template-data-aset.xlsx"
    link.style.display = "none"

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error creating template:", error)
    throw new Error("Gagal membuat template")
  }
}
