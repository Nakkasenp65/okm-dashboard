"use client";
import Button from "@/components/ui/button/Button";
import React, { useState, useRef } from "react";

interface BarcodeInputProps {
  onAddByBarcode: (barcode: string) => void;
  isLoading?: boolean;
}

export default function BarcodeInput({ onAddByBarcode, isLoading = false }: BarcodeInputProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount (optional, good for POS)
  // useEffect(() => {
  //   inputRef.current?.focus();
  // }, []);

  const handleBarcodeSubmit = () => {
    if (barcodeInput.trim()) {
      onAddByBarcode(barcodeInput.trim());
      setBarcodeInput(""); // Clear input after submit
      // Keep focus on input for continuous scanning
      inputRef.current?.focus();
    }
  };

  const handleBarcodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBarcodeSubmit();
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="imei-input"
        className="mb-2 block text-xl font-medium text-gray-700 dark:text-gray-300"
      >
        กรอกรหัส IMEI หรือรหัสสินค้า
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          id="imei-input"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleBarcodeKeyPress}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="สแกนหรือกรอกรหัส..."
          autoComplete="off"
        />
        <Button
          variant="primary"
          className="px-4 py-2 text-sm font-semibold"
          onClick={handleBarcodeSubmit}
          disabled={isLoading || !barcodeInput.trim()}
        >
          เพิ่ม
        </Button>
      </div>
    </div>
  );
}