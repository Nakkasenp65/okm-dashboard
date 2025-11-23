"use client";
import React, { useMemo } from "react";
import { Customer, Product, Discount } from "../../types/Pos";
import SellingList from "./SellingList";
import SellingSummary from "./SellingSummary";
import BarcodeInput from "./BarcodeInput";
import { GroupedProduct, SubItem } from "../../page";

interface SellingActionProps {
  selectedProductsMap: Map<number, GroupedProduct>;
  updateCart: (productId: number, updatedItems: SubItem[]) => void;
  currentCustomer: Customer | null;
  appliedDiscounts: Discount[];
  priceAdjustmentDiscounts: Discount[];
  onDiscountsChange: (discounts: Discount[]) => void;
  onOpenRetailPayment: () => void;
  productsMap: Map<number, Product>;
  hasActiveSession?: boolean;
  onRemoveItem?: (uniqueId: string, name: string) => void;
  onRenewItem?: (uniqueId: string, productId: string) => void;
  onUpdateItem?: (uniqueId: string, price: number) => void;
  onAddByBarcode?: (barcode: string) => void;
  isLoading?: boolean; // Prop นี้ได้รับค่าที่รวมสถานะ isCheckingOut มาจาก Page แล้ว
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
  hasActiveSession = false,
  onRemoveItem,
  onRenewItem,
  onUpdateItem,
  onAddByBarcode,
  isLoading = false,
}: SellingActionProps) {

  const allDiscounts = useMemo(() => {
    return [...appliedDiscounts, ...priceAdjustmentDiscounts];
  }, [appliedDiscounts, priceAdjustmentDiscounts]);

  const { subtotal, total } = useMemo(() => {
    const allItems: SubItem[] = Array.from(selectedProductsMap.values()).flatMap((group) => group.items);

    const sub = allItems.reduce((sum, item) => {
      const product = productsMap.get(item.productId);
      let originalPrice = item.unitPrice;

      if (product?.prices) {
        originalPrice = Number(product.prices.level_1) || 0;
      } else if (product?.price) {
         if (typeof product.price === 'object') {
          originalPrice = Number((product.price as { level_1?: string | number }).level_1) || 0;
        } else {
          originalPrice = Number(product.price) || 0;
        }
      }

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
    onDiscountsChange(appliedDiscounts.filter((d) => d.id !== discountId));
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">

      {/* Barcode Input Section */}
      {onAddByBarcode && (
        <BarcodeInput 
          onAddByBarcode={onAddByBarcode} 
          isLoading={isLoading} 
        />
      )}

      {/* Customer Information */}
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

      {/* Selling List */}
      <SellingList
        selectedProductsMap={selectedProductsMap}
        onUpdateCart={updateCart}
        productsMap={productsMap}
        onRemoveItem={onRemoveItem}
        onRenewItem={onRenewItem}
        onUpdateItem={onUpdateItem}
        isLoading={isLoading}
      />

      {/* Selling Summary */}
      {/* UPDATE: ส่ง prop isLoading ไปยัง SellingSummary */}
      <SellingSummary
        subtotal={subtotal}
        total={total}
        appliedDiscounts={appliedDiscounts} 
        priceAdjustmentDiscounts={priceAdjustmentDiscounts} 
        onRemoveDiscount={handleRemoveDiscount}
        onOpenPaymentModal={onOpenRetailPayment}
        isActionDisabled={selectedProductsMap.size === 0}
        hasActiveSession={hasActiveSession}
        isLoading={isLoading} 
      />
    </div>
  );
}