"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Image from "next/image";

type ScanMode = "quick" | "batch";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string, quantity: number) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerModalProps) {
  const [scanMode, setScanMode] = useState<ScanMode>("quick");
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [defaultQuantity, setDefaultQuantity] = useState<number>(1);
  const [scanHistory, setScanHistory] = useState<
    Array<{ barcode: string; qty: number; time: string }>
  >([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus on input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle barcode scan (Enter key press)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const qty = scanMode === "quick" ? 1 : quantityInput;

    // Add to scan history
    const newScan = {
      barcode: barcodeInput,
      qty: qty,
      time: new Date().toLocaleTimeString("th-TH"),
    };
    setScanHistory((prev) => [newScan, ...prev].slice(0, 10)); // Keep last 10 scans

    // Trigger scan callback
    onScan(barcodeInput, qty);

    // Visual feedback
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 300);

    // Clear input and reset quantity for batch mode
    setBarcodeInput("");
    if (scanMode === "batch") {
      setQuantityInput(defaultQuantity);
    }

    // Refocus input
    inputRef.current?.focus();
  };

  const handleModeChange = (mode: ScanMode) => {
    setScanMode(mode);
    setBarcodeInput("");
    if (mode === "batch") {
      setQuantityInput(defaultQuantity);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="w-full max-w-[900px] rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Image
              src="/images/assets/barcode_mode.png"
              alt="Barcode Scanner"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                📷 โหมดแสกนบาร์โค้ด
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                แสกนบาร์โค้ดสินค้าเพื่อเพิ่มลงในรายการขาย
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-blue-950/30 dark:to-purple-950/30">
          <h5 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            🎯 เลือกโหมดการแสกน
          </h5>
          <div className="grid grid-cols-2 gap-3">
            {/* Quick Scan Mode */}
            <button
              onClick={() => handleModeChange("quick")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                scanMode === "quick"
                  ? "border-green-500 bg-green-50 shadow-md dark:border-green-400 dark:bg-green-950/30"
                  : "border-gray-200 bg-white hover:border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
              }`}
            >
              <div className="text-4xl">⚡</div>
              <div className="text-center">
                <div className="font-bold text-gray-900 dark:text-white">
                  Quick Scan
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  แสกนทีละชิ้น (ทีละ 1)
                </div>
              </div>
              {scanMode === "quick" && (
                <div className="mt-2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                  ✓ กำลังใช้งาน
                </div>
              )}
            </button>

            {/* Batch Scan Mode */}
            <button
              onClick={() => handleModeChange("batch")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                scanMode === "batch"
                  ? "border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-950/30"
                  : "border-gray-200 bg-white hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
              }`}
            >
              <div className="text-4xl">📦</div>
              <div className="text-center">
                <div className="font-bold text-gray-900 dark:text-white">
                  Batch Scan
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  แสกนตามจำนวนที่ตั้งค่า
                </div>
              </div>
              {scanMode === "batch" && (
                <div className="mt-2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                  ✓ กำลังใช้งาน
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Batch Mode Config */}
        {scanMode === "batch" && (
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
            <h6 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-100">
              ⚙️ ตั้งค่าโหมด Batch Scan
            </h6>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  จำนวนเริ่มต้นต่อการแสกน
                </label>
                <input
                  type="number"
                  min="1"
                  value={defaultQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setDefaultQuantity(val);
                    setQuantityInput(val);
                  }}
                  className="w-full rounded-lg border-2 border-blue-300 bg-white px-3 py-2 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-blue-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  จำนวนสำหรับครั้งนี้
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantityInput}
                  onChange={(e) =>
                    setQuantityInput(parseInt(e.target.value) || 1)
                  }
                  className="w-full rounded-lg border-2 border-blue-300 bg-white px-3 py-2 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-blue-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scanner Input */}
        <div
          className={`rounded-xl border-4 p-6 transition-all ${
            isScanning
              ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-950/30"
              : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
          }`}
        >
          <form onSubmit={handleBarcodeSubmit}>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              🔍 แสกนหรือกรอกบาร์โค้ด
            </label>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="แสกนบาร์โค้ดหรือพิมพ์รหัสสินค้า..."
                className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-mono text-lg font-medium transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                autoComplete="off"
              />
              <Button
                variant="primary"
                className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 text-base font-semibold shadow-lg hover:from-green-600 hover:to-emerald-700"
                disabled={!barcodeInput.trim()}
                onClick={() => handleBarcodeSubmit({} as React.FormEvent)}
              >
                ✓ เพิ่ม
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span>💡</span>
              <span>
                {scanMode === "quick"
                  ? "แสกนบาร์โค้ดแล้วกด Enter เพื่อเพิ่มสินค้า 1 ชิ้น"
                  : `แสกนบาร์โค้ดแล้วกด Enter เพื่อเพิ่มสินค้า ${quantityInput} ชิ้น`}
              </span>
            </div>
          </form>
        </div>

        {/* Scan History */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              📋 ประวัติการแสกน (10 ครั้งล่าสุด)
            </h6>
            {scanHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
              >
                🗑️ ล้างประวัติ
              </button>
            )}
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {scanHistory.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                ยังไม่มีประวัติการแสกน
              </div>
            ) : (
              scanHistory.map((scan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <div>
                      <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {scan.barcode}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {scan.time}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    ×{scan.qty}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full py-3 text-base font-medium"
          >
            ปิด
          </Button>
          <Button
            variant="primary"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-base font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700"
          >
            เสร็จสิ้น
          </Button>
        </div>
      </div>
    </Modal>
  );
}
