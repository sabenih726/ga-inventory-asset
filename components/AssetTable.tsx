"use client"

import type { Asset } from "@/types/asset"

interface AssetTableProps {
  assets: Asset[]
  onEdit: (index: number) => void
  onDelete: (index: number) => void
}

export default function AssetTable({ assets, onEdit, onDelete }: AssetTableProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  const handleDelete = (index: number, assetNumber: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus aset "${assetNumber}"?`)) {
      onDelete(index)
    }
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">📋 Data Aset</h2>
          <p className="text-sm text-gray-600 mt-1">Total: 0 aset</p>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data aset</h3>
          <p className="text-gray-500">Mulai dengan menambahkan aset pertama Anda</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">📋 Data Aset</h2>
        <p className="text-sm text-gray-600 mt-1">Total: {assets.length} aset</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nomor Aset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Input
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset, index) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{asset.assetNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={asset.assetDescription}>
                    {asset.assetDescription}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{asset.assetLocation}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(asset.createdAt)}</div>
                  {asset.updatedAt && (
                    <div className="text-xs text-blue-500">Diperbarui: {formatDate(asset.updatedAt)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(index)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Edit aset"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index, asset.assetNumber)}
                    className="text-red-600 hover:text-red-900"
                    title="Hapus aset"
                  >
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-4">
        {assets.map((asset, index) => (
          <div key={asset.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{asset.assetNumber}</h3>
                <p className="text-sm text-gray-600 mt-1">{asset.assetDescription}</p>
              </div>
              <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
            </div>

            <div className="mb-3">
              <p className="text-sm">
                <span className="font-medium">📍 Lokasi:</span> {asset.assetLocation}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                📅 {formatDate(asset.createdAt)}
                {asset.updatedAt && (
                  <>
                    <br />🔄 Diperbarui: {formatDate(asset.updatedAt)}
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(index)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(index, asset.assetNumber)}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                🗑️ Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
