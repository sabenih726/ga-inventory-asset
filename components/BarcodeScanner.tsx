"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (decodedText: string) => void
  onError: (error: string) => void
}

export default function BarcodeScanner({ isOpen, onClose, onScanSuccess, onError }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const startScanner = async () => {
    try {
      setIsScanning(true)
      scannerRef.current = new Html5Qrcode("qr-reader")

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScanSuccess(decodedText)
          stopScanner()
        },
        (errorMessage) => {
          // Ignore frequent scan failures
        },
      )
    } catch (err) {
      console.error("Unable to start scanning.", err)
      onError("Gagal memulai kamera. Pastikan Anda memberikan izin akses kamera.")
      stopScanner()
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      } catch (err) {
        console.error("Failed to stop QR Code scanning.", err)
      } finally {
        setIsScanning(false)
        onClose()
      }
    } else {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner()
    }

    return () => {
      if (scannerRef.current && isScanning) {
        stopScanner()
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-xl max-w-lg w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">📷 Scan Barcode Aset</h3>
          <button onClick={stopScanner} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Arahkan kamera ke barcode. Pemindai akan otomatis mendeteksi.</p>
        <div
          id="qr-reader"
          className="w-full max-w-md mx-auto border-2 border-blue-500 rounded-lg overflow-hidden"
        ></div>
        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={stopScanner}
            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
