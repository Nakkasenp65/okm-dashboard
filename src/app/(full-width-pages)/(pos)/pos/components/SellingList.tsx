"use client";
import React from "react";
import { GroupedProduct, SubItem } from "../page";
import SellingListItem from "./SellingListItem";
import { Product } from "../types/Pos";

interface SellingListProps {
  selectedProductsMap: Map<number, GroupedProduct>;
  onUpdateCart: (productId: number, updatedItems: SubItem[]) => void;
  productsMap: Map<number, Product>;
}

export default function SellingList({ selectedProductsMap, onUpdateCart, productsMap }: SellingListProps) {
  const allItems = Array.from(selectedProductsMap.values()).flatMap((group) => group.items);

  const handlePriceChange = (itemToUpdate: SubItem, newPrice: number) => {
    const group = selectedProductsMap.get(itemToUpdate.productId);
    if (!group) return;

    const updatedItems = group.items.map((item) =>
      item.uniqueId === itemToUpdate.uniqueId ? { ...item, unitPrice: newPrice } : item,
    );
    onUpdateCart(itemToUpdate.productId, updatedItems);
  };

  const handleRemoveItem = (itemToRemove: SubItem) => {
    const group = selectedProductsMap.get(itemToRemove.productId);
    if (!group) return;

    const updatedItems = group.items.filter((item) => item.uniqueId !== itemToRemove.uniqueId);
    onUpdateCart(itemToRemove.productId, updatedItems);
  };

  return (
    <>
      {/* Header: แสดงเฉพาะบนจอ lg ขึ้นไป */}
      <div className="xl:text-md hidden xl:grid xl:grid-cols-12 xl:items-center xl:gap-2 xl:border-b xl:border-gray-200 xl:pb-2 xl:font-semibold xl:text-black dark:xl:border-gray-700 dark:xl:text-gray-400">
        {/* Header Column 1: Item name (6/12) */}
        <span className="xl:col-span-6">รายการ</span>
        {/* Header Column 2: Original Price (2/12) */}
        <span className="xl:col-span-2 xl:text-center">ราคาปลีก</span>
        {/* Header Column 3: Selling Price (3/12) */}
        <span className="xl:col-span-3 xl:text-center">ราคาขาย</span>
        {/* Header Column 4: Remove Item (1/12) */}
        <span className="xl:col-span-1 xl:text-center">ลบ</span>
      </div>

      {/* Content: List of selling items */}
      <div className="flex-1 overflow-y-auto pt-2 xl:pt-0">
        {allItems.length > 0 ? (
          allItems.map((item) => {
            const originalPrice = productsMap.get(item.productId)?.price ?? 0;
            return (
              <SellingListItem
                key={item.uniqueId}
                item={item}
                originalPrice={originalPrice}
                onPriceChange={(newPrice) => handlePriceChange(item, newPrice)}
                onRemove={() => handleRemoveItem(item)}
              />
            );
          })
        ) : (
          // Content: Empty state when no items are in the list
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-gray-500 dark:text-gray-400">ยังไม่มีสินค้าในรายการ</p>
          </div>
        )}
      </div>
    </>
  );
}
