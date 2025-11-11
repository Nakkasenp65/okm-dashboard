"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { FaPrint, FaReceipt, FaShareAlt } from "react-icons/fa";

interface SuccessScreenProps {
  changeAmount: number;
  onFinishTransaction: () => void;
  onPrintShortReceipt: () => void;
  onPrintFullReceipt: () => void;
  onSendEReceipt: () => void;
}

export default function SuccessScreen({
  changeAmount,
  onFinishTransaction,
  onPrintShortReceipt,
  onPrintFullReceipt,
  onSendEReceipt,
}: SuccessScreenProps) {
  // State for auto-printing preference
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(false);

  // Effect to trigger auto-print when the component mounts
  useEffect(() => {
    if (autoPrintEnabled) {
      // Use a small timeout to allow the user to see the success screen
      const timer = setTimeout(() => {
        onPrintShortReceipt();
      }, 500); // 0.5 second delay

      return () => clearTimeout(timer);
    }
  }, [autoPrintEnabled, onPrintShortReceipt]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
        <span className="text-4xl text-green-500">✓</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        ชำระเงินสำเร็จ
      </h2>

      {changeAmount > 0 && (
        <>
          <p className="text-lg text-gray-500 dark:text-gray-400">เงินทอน</p>
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
            ฿
            {changeAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </>
      )}

      <div className="my-4 w-full max-w-sm border-t border-gray-200 dark:border-gray-700"></div>

      {/* Action Buttons */}
      <div className="w-full max-w-xs space-y-3">
        <Button
          variant="outline"
          onClick={onPrintFullReceipt}
          className="flex w-full items-center justify-center gap-3 py-3 text-base"
        >
          <FaPrint /> พิมพ์ใบเสร็จเต็ม
        </Button>
        <Button
          variant="outline"
          onClick={onPrintShortReceipt}
          className="flex w-full items-center justify-center gap-3 py-3 text-base"
        >
          <FaReceipt /> พิมพ์ใบเสร็จย่อ
        </Button>
        <Button
          variant="outline"
          onClick={onSendEReceipt}
          className="flex w-full items-center justify-center gap-3 py-3 text-base"
        >
          <FaShareAlt /> ส่ง E-Receipt
        </Button>
      </div>

      {/* Auto-print Toggle */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <input
          type="checkbox"
          id="auto-print-checkbox"
          checked={autoPrintEnabled}
          onChange={(e) => setAutoPrintEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="auto-print-checkbox"
          className="cursor-pointer text-sm text-gray-600 dark:text-gray-400"
        >
          พิมพ์ใบเสร็จย่ออัตโนมัติ
        </label>
      </div>

      <Button
        onClick={onFinishTransaction}
        className="mt-4 w-full max-w-xs py-4 text-lg font-semibold"
      >
        เสร็จสิ้นรายการ
      </Button>
    </div>
  );
}
