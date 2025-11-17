"use client";
import React, { useMemo } from "react";
import Button from "@/components/ui/button/Button";
import { Customer, Product, Discount } from "../types/Pos";
import SellingList from "./SellingList";
import SellingSummary from "./SellingSummary";
import { GroupedProduct, SubItem } from "../page";

interface SellingActionProps {
  selectedProductsMap: Map<number, GroupedProduct>;
  updateCart: (productId: number, updatedItems: SubItem[]) => void;
  currentCustomer: Customer | null;
  appliedDiscounts: Discount[]; // ส่วนลดท้ายบิล (manual)
  priceAdjustmentDiscounts: Discount[]; // ส่วนลดจากการปรับราคา (auto)
  onDiscountsChange: (discounts: Discount[]) => void;
  onOpenRetailPayment: () => void;
  productsMap: Map<number, Product>;
}

export default function SellingAction({
  selectedProductsMap,
  updateCart,
  currentCustomer,
  appliedDiscounts,
  priceAdjustmentDiscounts,
  onDiscountsChange,
  onOpenRetailPayment,
  productsMap,
}: SellingActionProps) {
  // ✅ รวมส่วนลดทั้ง 2 ประเภท
  const allDiscounts = useMemo(() => {
    return [...appliedDiscounts, ...priceAdjustmentDiscounts];
  }, [appliedDiscounts, priceAdjustmentDiscounts]);

  const { subtotal, total } = useMemo(() => {
    const allItems: SubItem[] = Array.from(selectedProductsMap.values()).flatMap((group) => group.items);

    // ยอดรวม 'ก่อน' ส่วนลดใดๆ จะคิดจากราคาตั้งต้นเสมอ
    const sub = allItems.reduce((sum, item) => {
      const originalPrice = productsMap.get(item.productId)?.price ?? item.unitPrice;
      return sum + originalPrice;
    }, 0);

    let totalDiscountAmount = 0;
    allDiscounts.forEach((discount) => {
      totalDiscountAmount += discount.type === "percentage" ? sub * (discount.value / 100) : discount.value;
    });

    return {
      subtotal: sub,
      total: Math.max(0, sub - totalDiscountAmount),
    };
  }, [selectedProductsMap, allDiscounts, productsMap]);

  const handleRemoveDiscount = (discountId: string) => {
    // จะลบได้เฉพาะส่วนลดท้ายบิล (ที่ user เพิ่มเอง)
    onDiscountsChange(appliedDiscounts.filter((d) => d.id !== discountId));
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      <div className="mb-4">
        <label htmlFor="imei-input" className="mb-2 block text-xl font-medium text-gray-700 dark:text-gray-300">
          กรอกรหัส IMEI หรือรหัสสินค้า
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="imei-input"
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            placeholder="สแกนหรือกรอกรหัส..."
          />
          <Button variant="primary" className="px-4 py-2 text-sm font-semibold">
            เพิ่ม
          </Button>
        </div>
      </div>

      {currentCustomer && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/30">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xl shadow-md ${currentCustomer.color}`}
          >
            {currentCustomer.emoji}
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
              ลูกค้าปัจจุบัน {currentCustomer.memberId}{" "}
              <span className="rounded-xl border bg-purple-700 p-0.5 px-2 text-[10px] text-white">
                {currentCustomer.level}
              </span>
            </p>
            <p className="font-semibold text-purple-900 dark:text-purple-100">{currentCustomer.name}</p>
            {currentCustomer.customerPoint !== undefined && (
              <p className="text-xs text-purple-700 dark:text-purple-300">คะแนนสะสม: {currentCustomer.customerPoint}</p>
            )}
          </div>
        </div>
      )}

      <SellingList selectedProductsMap={selectedProductsMap} onUpdateCart={updateCart} productsMap={productsMap} />

      <SellingSummary
        subtotal={subtotal}
        total={total}
        appliedDiscounts={appliedDiscounts} // ✅ ส่วนลดท้ายบิล
        priceAdjustmentDiscounts={priceAdjustmentDiscounts} // ✅ ส่วนลดปรับราคา
        onRemoveDiscount={handleRemoveDiscount}
        onOpenPaymentModal={onOpenRetailPayment}
        isActionDisabled={selectedProductsMap.size === 0}
      />
    </div>
  );
}
