"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

// Type สำหรับข้อมูลที่จะส่งกลับไป
export interface CashDrawerActivity {
  type: "in" | "out";
  amount: number;
  reason: string;
}

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (activity: CashDrawerActivity) => void;
}

// --- Quick Input Data ---
const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];
const QUICK_REASONS_IN = [
  "เงินทอนเริ่มต้น",
  "เติมเงินทอนระหว่างวัน",
  "รับเงินจากลูกค้า",
];
const QUICK_REASONS_OUT = [
  "ค่า Messenger",
  "ซื้อของเข้าร้าน",
  "ค่าใช้จ่ายอื่นๆ",
  "เบิกเงินส่วนตัว",
];

export default function CashDrawerModal({
  isOpen,
  onClose,
  onConfirm,
}: CashDrawerModalProps) {
  const [mode, setMode] = useState<"in" | "out">("in");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  // Reset state เมื่อ modal ถูกปิด
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMode("in");
        setAmount("");
        setReason("");
      }, 200); // หน่วงเวลาเล็กน้อยเพื่อให้ transition ของ modal จบก่อน
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !reason.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      return;
    }

    onConfirm({
      type: mode,
      amount: numericAmount,
      reason: reason.trim(),
    });
    onClose();
  };

  const isConfirmDisabled =
    !amount || parseFloat(amount) <= 0 || !reason.trim();
  const quickReasons = mode === "in" ? QUICK_REASONS_IN : QUICK_REASONS_OUT;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl p-0 shadow-2xl"
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
          จัดการลิ้นชักเก็บเงิน
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          บันทึกการนำเงินเข้า-ออกจากลิ้นชัก
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Mode Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {/* Deposit */}
          <button
            onClick={() => setMode("in")}
            className={`rounded-md py-2 font-semibold transition-colors ${mode === "in" ? "bg-green-500 text-white shadow" : "text-gray-600 hover:bg-green-100 dark:text-gray-300 dark:hover:bg-green-900/50"}`}
          >
            นำเงินเข้า
          </button>
          {/* Withdraw */}
          <button
            onClick={() => setMode("out")}
            className={`rounded-md py-2 font-semibold transition-colors ${mode === "out" ? "bg-red-500 text-white shadow" : "text-gray-600 hover:bg-red-100 dark:text-gray-300 dark:hover:bg-red-900/50"}`}
          >
            นำเงินออก
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label
            htmlFor="cash-amount"
            className="block text-base font-medium text-gray-700 dark:text-gray-300"
          >
            จำนวนเงิน (บาท)
          </label>
          <input
            id="cash-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-lg border-gray-300 p-3 text-2xl font-bold shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((val) => (
              <Button
                key={val}
                size="sm"
                variant="outline"
                onClick={() => setAmount(val.toString())}
              >
                {val.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Reason Input */}
        <div>
          <label
            htmlFor="cash-reason"
            className="block text-base font-medium text-gray-700 dark:text-gray-300"
          >
            เหตุผล
          </label>
          <textarea
            id="cash-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              mode === "in"
                ? "เช่น เงินทอนเริ่มต้น..."
                : "เช่น ค่า Messenger..."
            }
            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {quickReasons.map((text) => (
              <Button
                key={text}
                size="sm"
                variant="outline"
                onClick={() => setReason(text)}
              >
                {text}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
        <Button
          variant="outline"
          onClick={onClose}
          className="py-3 text-base font-medium"
        >
          ยกเลิก
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          className={`py-3 text-base font-semibold shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${mode === "in" ? "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" : "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"}`}
        >
          ยืนยันรายการ
        </Button>
      </div>
    </Modal>
  );
}
