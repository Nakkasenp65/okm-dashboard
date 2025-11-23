"use client";

import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Button from "@/components/ui/button/Button";
import { ADD_BUTTONS, PaymentMethod } from "./MixedPaymentTypes";

interface AddingViewProps {
  methodToAdd: PaymentMethod | null;
  remainingToAllocate: number;
  initialAmount: string;
  onCancel: () => void;
  onConfirm: (amount: string) => void;
}

export default function AddingView({
  methodToAdd,
  remainingToAllocate,
  initialAmount,
  onCancel,
  onConfirm,
}: AddingViewProps) {
  const [amount, setAmount] = useState(initialAmount);
  const selectedBtn = ADD_BUTTONS.find((b) => b.method === methodToAdd);

  const numericAmount = parseFloat(amount || "0");
  const isValid = numericAmount > 0 && numericAmount <= remainingToAllocate + 0.01; // Allow small tolerance
  const isOver = numericAmount > remainingToAllocate + 0.01;

  return (
    <div className="flex h-full flex-col p-6 animate-in slide-in-from-right duration-200">
      <button
        onClick={onCancel}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <FaArrowLeft /> ย้อนกลับ
      </button>

      <div className="flex flex-1 flex-col items-center gap-8">
        
        {/* Icon Header */}
        <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 shadow-inner">
            {selectedBtn && <selectedBtn.icon className="text-4xl" />}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            {selectedBtn?.label}
            </h3>
        </div>
        
        {/* Input Area */}
        <div className="w-full max-w-xs space-y-2">
            <label className="text-sm text-gray-500 text-center block">ระบุจำนวนเงิน</label>
            <div className="relative">
                <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full rounded-2xl border-2 bg-transparent p-4 text-center text-5xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20 transition-all
                    ${isOver ? "border-red-500 text-red-500" : "border-blue-500 text-gray-800 dark:text-white"}
                `}
                autoFocus
                placeholder="0.00"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && isValid) onConfirm(amount);
                }}
                />
            </div>
            {isOver && <p className="text-red-500 text-center text-sm">ยอดเงินเกินจำนวนที่ต้องชำระ</p>}
        </div>
        
        {/* Info */}
        <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800/50">
             <p className="text-gray-500 text-sm">ยอดคงเหลือที่ต้องจัดสรร</p>
             <p className="text-xl font-bold">฿{remainingToAllocate.toFixed(2)}</p>
        </div>
      </div>

      <Button 
        onClick={() => onConfirm(amount)} 
        disabled={!isValid}
        className={`w-full py-4 text-xl shadow-lg transition-all ${!isValid ? "opacity-50 cursor-not-allowed" : "hover:translate-y-[-2px]"}`}
      >
        ยืนยันยอดเงิน
      </Button>
    </div>
  );
}