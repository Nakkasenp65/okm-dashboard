"use client";
import React from "react";
import Button from "@/components/ui/button/Button";
import { FaTimes } from "react-icons/fa";
import { Discount } from "./(modal)/DiscountModal";

interface SellingSummaryProps {
  subtotal: number;
  total: number;
  appliedDiscounts: Discount[];
  onRemoveDiscount: (discountId: string) => void;
  onOpenPaymentModal: () => void;
  isActionDisabled: boolean;
}

export default function SellingSummary({
  subtotal,
  total,
  appliedDiscounts,
  onRemoveDiscount,
  onOpenPaymentModal,
  isActionDisabled,
}: SellingSummaryProps) {
  return (
    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-base font-semibold text-gray-800 dark:text-gray-200">
          <span>ยอดก่อนหักส่วนลด</span>
          <span>{subtotal.toFixed(2)} ฿</span>
        </div>
        {appliedDiscounts.map((discount) => {
          const discountValue =
            discount.type === "percentage"
              ? subtotal * (discount.value / 100)
              : discount.value;
          return (
            <div
              key={discount.id}
              className="flex items-center justify-between text-red-600 dark:text-red-400"
            >
              <span className="flex items-center gap-2">
                {discount.name}
                <span className="font-mono text-xs">
                  (
                  {discount.type === "percentage"
                    ? `${discount.value}%`
                    : `${discount.value}฿`}
                  )
                </span>
              </span>
              <span className="flex items-center gap-2 font-medium">
                -{discountValue.toFixed(2)} ฿
                <button
                  onClick={() => onRemoveDiscount(discount.id)}
                  className="text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-300"
                >
                  <FaTimes size={12} />
                </button>
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

      <Button
        variant="primary"
        className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-lg font-semibold shadow-lg transition-all hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onOpenPaymentModal}
        disabled={isActionDisabled}
      >
        ชำระเงิน
      </Button>
    </div>
  );
}
