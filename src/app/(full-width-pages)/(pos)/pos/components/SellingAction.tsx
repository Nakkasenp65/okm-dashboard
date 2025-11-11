"use client";
import React, { useMemo } from "react";
import Button from "@/components/ui/button/Button";
import { Customer } from "./(modal)/CustomerModal";
import { Discount } from "./(modal)/DiscountModal";
import SellingList from "./SellingList";
import SellingSummary from "./SellingSummary";
import { GroupedProduct, SubItem } from "../page";

interface SellingActionProps {
  selectedProductsMap: Map<number, GroupedProduct>;
  updateCart: (productId: number, updatedItems: SubItem[]) => void;
  currentCustomer: Customer | null;
  appliedDiscounts: Discount[];
  onDiscountsChange: (discounts: Discount[]) => void;
  onOpenRetailPayment: () => void; // Changed from onPaymentSuccess
}

export default function SellingAction({
  selectedProductsMap,
  updateCart,
  currentCustomer,
  appliedDiscounts,
  onDiscountsChange,
  onOpenRetailPayment,
}: SellingActionProps) {
  // --- คำนวณยอดทั้งหมดโดยใช้ useMemo จาก Map ---
  const { subtotal, total } = useMemo(() => {
    const allItems: SubItem[] = Array.from(
      selectedProductsMap.values(),
    ).flatMap((group) => group.items);
    const sub = allItems.reduce((sum, item) => sum + item.unitPrice, 0);

    let totalDiscountAmount = 0;
    appliedDiscounts.forEach((discount) => {
      totalDiscountAmount +=
        discount.type === "percentage"
          ? sub * (discount.value / 100)
          : discount.value;
    });

    return {
      subtotal: sub,
      total: Math.max(0, sub - totalDiscountAmount),
    };
  }, [selectedProductsMap, appliedDiscounts]);

  // --- ฟังก์ชันจัดการ Event ---
  const handleRemoveDiscount = (discountId: string) => {
    onDiscountsChange(appliedDiscounts.filter((d) => d.id !== discountId));
  };

  const handleMockClick = () => {
    console.log("Mock add product button clicked.");
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      {/* === ส่วนกรอกรหัสสินค้า === */}
      <div className="mb-4">
        <label
          htmlFor="imei-input"
          className="mb-2 block text-xl font-medium text-gray-700 dark:text-gray-300"
        >
          กรอกรหัส IMEI หรือรหัสสินค้า
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="imei-input"
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            placeholder="สแกนหรือกรอกรหัส..."
          />
          <Button
            variant="primary"
            className="px-4 py-2 text-sm font-semibold"
            onClick={handleMockClick}
          >
            เพิ่ม
          </Button>
        </div>
      </div>

      {/* ส่วนแสดงข้อมูลลูกค้าที่เลือก */}
      {currentCustomer && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/30">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xl shadow-md ${currentCustomer.color}`}
          >
            {currentCustomer.emoji}
          </div>
          <div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              ลูกค้าปัจจุบัน
            </p>
            <p className="font-semibold text-purple-900 dark:text-purple-100">
              {currentCustomer.name}
            </p>
          </div>
        </div>
      )}

      <SellingList
        selectedProductsMap={selectedProductsMap}
        onUpdateCart={updateCart}
      />

      <SellingSummary
        subtotal={subtotal}
        total={total}
        appliedDiscounts={appliedDiscounts}
        onRemoveDiscount={handleRemoveDiscount}
        onOpenPaymentModal={onOpenRetailPayment} // Pass the correct handler
        isActionDisabled={selectedProductsMap.size === 0}
      />
    </div>
  );
}
