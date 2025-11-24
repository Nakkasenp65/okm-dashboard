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

      {/* Customer Information - Always Visible */}
      <div className={`mb-3 flex items-center gap-2 rounded-lg border p-2 transition-all ${
        currentCustomer 
          ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30' 
          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
      }`}>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base shadow-sm ${
            currentCustomer 
              ? `bg-gradient-to-br ${currentCustomer.color}` 
              : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
          }`}
        >
          {currentCustomer ? currentCustomer.emoji : '👤'}
        </div>
        <div className="min-w-0 flex-1">
          {currentCustomer ? (
            <>
              <p className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300">
                <span className="truncate">ลูกค้า {currentCustomer.memberId}</span>
                <span className="rounded-md border bg-purple-700 px-1.5 py-0.5 text-[10px] text-white">
                  {currentCustomer.level}
                </span>
              </p>
              <p className="truncate text-sm font-semibold text-purple-900 dark:text-purple-100">
                {currentCustomer.name}
              </p>
              {currentCustomer.customerPoint !== undefined && (
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {currentCustomer.customerPoint} คะแนน
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400">ลูกค้าปัจจุบัน</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">ลูกค้าทั่วไป</p>
            </>
          )}
        </div>
      </div>

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