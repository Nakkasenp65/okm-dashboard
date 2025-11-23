"use client";

import React from "react";
import { FaTrashAlt } from "react-icons/fa";
import { PlannedPayment, ADD_BUTTONS, PaymentMethod } from "./MixedPaymentTypes";

interface PlanningViewProps {
  totalToPay: number;
  remainingToAllocate: number;
  plannedPayments: PlannedPayment[];
  onRemovePlan: (id: string) => void;
  onStartAdding: (method: PaymentMethod) => void;
}

export default function PlanningView({
  totalToPay,
  remainingToAllocate,
  plannedPayments,
  onRemovePlan,
  onStartAdding,
}: PlanningViewProps) {
  
  // Convert method key to label for display
  const getButtonLabel = (key: string) => ADD_BUTTONS.find(b => b.method === key)?.label || key;
  const getButtonIcon = (key: string) => {
      const btn = ADD_BUTTONS.find(b => b.method === key);
      return btn ? <btn.icon /> : null;
  }

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
        <div>
          <p className="text-sm text-gray-500">ยอดที่ต้องชำระ (Target)</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">
            {totalToPay.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">คงเหลือที่ต้องจัดสรร</p>
          <p
            className={`text-xl font-bold ${
              remainingToAllocate > 0.01 ? "text-red-500" : "text-green-500"
            }`}
          >
            {remainingToAllocate.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payment List */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
          รายการที่จัดสรรแล้ว
        </h3>
        <div className="space-y-2">
          {plannedPayments.map((plan, index) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  {getButtonIcon(plan.methodKey)}
                </div>
                <div>
                  <p className="font-bold text-gray-700 dark:text-gray-200">{getButtonLabel(plan.methodKey)}</p>
                  <p className="text-xs text-gray-500">รายการที่ {index + 1}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ฿{plan.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onRemovePlan(plan.id)}
                  className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
          
          {plannedPayments.length === 0 && (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 dark:border-gray-700">
               <p>ยังไม่ได้เลือกวิธีการชำระเงิน</p>
               <p className="text-xs mt-1">กดปุ่มด้านล่างเพื่อเพิ่ม</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Add Buttons */}
      <div className="mt-4 border-t pt-4 dark:border-gray-700">
        <p className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
          เพิ่มยอดชำระโดย
        </p>
        <div className="grid grid-cols-4 gap-2">
          {ADD_BUTTONS.map((btn) => (
            <button
              key={btn.method}
              onClick={() => onStartAdding(btn.method)}
              disabled={remainingToAllocate <= 0.01}
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <btn.icon className="text-2xl text-blue-500" />
              <span className="text-xs font-medium">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}