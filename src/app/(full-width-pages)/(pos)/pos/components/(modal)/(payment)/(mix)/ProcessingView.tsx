// ProcessingView.tsx
"use client";

import React from "react";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import Button from "@/components/ui/button/Button";
import { PlannedPayment, ADD_BUTTONS } from "./MixedPaymentTypes";

interface ProcessingViewProps {
  plannedPayments: PlannedPayment[];
  currentProcessingIndex: number;
  showSuccess: boolean;
  onConfirmStep: () => void;
}

export default function ProcessingView({
  plannedPayments,
  currentProcessingIndex,
  showSuccess,
  onConfirmStep,
}: ProcessingViewProps) {
  const isFinished = currentProcessingIndex >= plannedPayments.length;

  // Case 1: Finished All Steps
  if (isFinished) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="animate-in zoom-in mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 duration-300">
          <FaCheckCircle className="text-6xl" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-green-600">
          ชำระเงินครบถ้วนแล้ว
        </h2>
        <p className="mb-8 text-gray-500 dark:text-gray-400">
          รายการชำระเงินทั้งหมดเสร็จสมบูรณ์
        </p>
      </div>
    );
  }

  // Case 2: Success Animation between steps
  if (showSuccess) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <div className="animate-bounce rounded-full bg-green-500 p-6 text-white shadow-lg">
          <FaCheckCircle className="text-6xl" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-green-600">
          บันทึกยอดแล้ว!
        </h2>
      </div>
    );
  }

  // Case 3: Payment Step
  const currentPlan = plannedPayments[currentProcessingIndex];
  const selectedBtn = ADD_BUTTONS.find(
    (b) => b.method === currentPlan.methodKey
  );

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">ขั้นตอนการชำระเงิน</h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
          {currentProcessingIndex + 1} / {plannedPayments.length}
        </span>
      </div>

      {/* Current Step Card */}
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-blue-500 bg-blue-50 p-8 dark:bg-blue-900/20">
        <div className="mb-4 text-blue-600 dark:text-blue-400">
          {selectedBtn && <selectedBtn.icon className="text-6xl" />}
        </div>
        <h2 className="mb-2 text-3xl font-bold">{currentPlan.method}</h2>
        <p className="mb-6 text-gray-500">ยอดที่ต้องชำระ</p>
        <div className="text-5xl font-bold text-blue-700 dark:text-blue-300">
          ฿{currentPlan.amount.toFixed(2)}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-lg bg-yellow-50 p-3 text-center text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
          <FaClock className="mr-2 inline" />
          รอรับเงินจากลูกค้า...
        </div>
        <Button
          onClick={onConfirmStep}
          className="w-full bg-green-600 py-4 text-xl hover:bg-green-700"
        >
          ยืนยันการรับเงิน
        </Button>
      </div>
    </div>
  );
}