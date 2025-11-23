"use client";
import React from "react";
import Button from "@/components/ui/button/Button";
import { FaTimes, FaSpinner } from "react-icons/fa"; // ADD: Import icon spinner
import { Discount } from "../../types/Pos";

interface SellingSummaryProps {
  subtotal: number;
  total: number;
  appliedDiscounts: Discount[];
  priceAdjustmentDiscounts: Discount[];
  onRemoveDiscount: (discountId: string) => void;
  onOpenPaymentModal: () => void;
  isActionDisabled: boolean;
  hasActiveSession?: boolean;
  isLoading?: boolean; // ADD: รับ prop isLoading
}

export default function SellingSummary({
  subtotal,
  total,
  appliedDiscounts,
  priceAdjustmentDiscounts,
  onRemoveDiscount,
  onOpenPaymentModal,
  isActionDisabled,
  hasActiveSession = false,
  isLoading = false, // ADD: Default value
}: SellingSummaryProps) {
  
  const allDiscountsToDisplay = [
    ...priceAdjustmentDiscounts,
    ...appliedDiscounts,
  ];

  return (
    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-base font-semibold text-gray-800 dark:text-gray-200">
          <span>ยอดรวม (ราคาตั้งต้น)</span>
          <span>{subtotal.toFixed(2)} ฿</span>
        </div>
        {allDiscountsToDisplay.map((discount) => {
          const isAdjustment = discount.id.startsWith("adj-");
          return (
            <div
              key={discount.id}
              className="flex items-center justify-between text-red-600 dark:text-red-400"
            >
              <span className="flex items-center gap-2">
                {discount.name}
                {!isAdjustment && (
                  <span className="font-mono text-xs">
                    (
                    {discount.type === "percentage"
                      ? `${discount.value}%`
                      : `${discount.value}฿`}
                    )
                  </span>
                )}
              </span>
              <span className="flex items-center gap-2 font-medium">
                -{discount.value.toFixed(2)} ฿
                {!isAdjustment && (
                  <button
                    onClick={() => !isLoading && onRemoveDiscount(discount.id)} // Prevent remove while loading
                    disabled={isLoading}
                    className="text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50 dark:hover:text-red-300"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t-2 border-gray-300 pt-3 text-xl font-bold text-gray-900 dark:border-gray-600 dark:text-white">
        <span>ยอดสุทธิ</span>
        <span className="text-4xl text-emerald-600 dark:text-emerald-400">
          {total.toFixed(2)} ฿
        </span>
      </div>

      {/* UPDATE: Button with Loading State */}
      <Button
        variant="primary"
        className={`mt-4 w-full py-3 text-lg font-semibold shadow-lg transition-all 
          ${isLoading 
            ? "cursor-wait opacity-80 bg-gray-500" 
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          }
          disabled:cursor-not-allowed disabled:opacity-50`}
        onClick={onOpenPaymentModal}
        disabled={isActionDisabled || isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin" />
            <span>กำลังประมวลผล...</span>
          </div>
        ) : (
          hasActiveSession ? "ดำเนินการชำระเงินต่อ" : "ชำระเงิน"
        )}
      </Button>
    </div>
  );
}