"use client";
import React from "react";
import SellingListItem from "./SellingListItem";
import { Product } from "../../types/Pos";
import { GroupedProduct, SubItem } from "../../page";

interface SellingListProps {
  selectedProductsMap: Map<number, GroupedProduct>;
  onUpdateCart: (productId: number, updatedItems: SubItem[]) => void;
  onUpdateItem?: (uniqueId: string, price: number) => void;
  productsMap: Map<number, Product>;
  onRemoveItem?: (uniqueId: string, name: string) => void;
  onRenewItem?: (uniqueId: string, productId: string) => void;
  isLoading?: boolean;
}

export default function SellingList({ selectedProductsMap, onUpdateCart, onUpdateItem, productsMap, onRemoveItem, onRenewItem, isLoading = false }: SellingListProps) {
  const allItems = Array.from(selectedProductsMap.values()).flatMap((group) => group.items);
  console.log("SellingList allItems:", allItems.length, allItems);

  const handlePriceChange = (itemToUpdate: SubItem, newPrice: number) => {
    if (onUpdateItem) {
      onUpdateItem(itemToUpdate.uniqueId, newPrice);
    } else {
      // Fallback to legacy behavior if onUpdateItem is not provided
      const group = selectedProductsMap.get(itemToUpdate.productId);
      if (!group) return;

      const updatedItems = group.items.map((item) =>
        item.uniqueId === itemToUpdate.uniqueId ? { ...item, unitPrice: newPrice } : item,
      );
      onUpdateCart(itemToUpdate.productId, updatedItems);
    }
  };

  const handleRemoveItem = (itemToRemove: SubItem) => {
    if (onRemoveItem) {
      onRemoveItem(itemToRemove.uniqueId, itemToRemove.name);
    } else {
      // Fallback for legacy behavior (if needed, though we are moving to API)
      const group = selectedProductsMap.get(itemToRemove.productId);
      if (!group) return;

      const updatedItems = group.items.filter((item) => item.uniqueId !== itemToRemove.uniqueId);
      onUpdateCart(itemToRemove.productId, updatedItems);
    }
  };

  return (
    <>
      {/* Header: แสดงเฉพาะบนจอ 2xl ขึ้นไป */}
      <div className="hidden 2xl:grid 2xl:grid-cols-12 2xl:items-center 2xl:gap-1 2xl:border-b 2xl:border-gray-200 2xl:py-2 2xl:font-bold 2xl:text-lg 2xl:text-black dark:2xl:border-gray-700 dark:2xl:text-gray-300">
        {/* Header Column 1: Item name (6/12) */}
        <span className="2xl:col-span-6 pl-2">รายการสินค้า</span>
        {/* Header Column 2: Original Price (3/12) */}
        <span className="2xl:col-span-3 2xl:text-center">ราคาปลีก</span>
        {/* Header Column 3: Selling Price (3/12) */}
        <span className="2xl:col-span-3 2xl:text-center">ราคาขาย</span>
      </div>


      {/* Content: List of selling items */}
      <div className="flex-1 overflow-y-auto pt-2 xl:pt-0">
        {allItems.length > 0 ? (
          allItems.map((item) => {

            const stockPrice = (item.productData as { stockPrice?: string | number })?.stockPrice;
            // Handle new price object structure or legacy number
            const productPrice = item.productData?.prices;
            const mapPrice = productsMap.get(item.productId)?.prices;

            let originalPrice = 0;
            if (productPrice) {
               originalPrice = Number(productPrice.level_1) || 0;
            } else if (mapPrice) {
               originalPrice = Number(mapPrice.level_1) || 0;
            } else {
               // Fallback to legacy checks if needed
               const legacyProductPrice = item.productData?.price;
               const legacyMapPrice = productsMap.get(item.productId)?.price;

               if (typeof legacyProductPrice === 'object' && legacyProductPrice !== null) {
                  originalPrice = Number((legacyProductPrice as { level_1?: string | number }).level_1) || 0;
               } else if (typeof legacyProductPrice === 'number') {
                  originalPrice = legacyProductPrice;
               } else if (typeof legacyMapPrice === 'object' && legacyMapPrice !== null) {
                  originalPrice = Number((legacyMapPrice as { level_1?: string | number }).level_1) || 0;
               } else if (typeof legacyMapPrice === 'number') {
                  originalPrice = legacyMapPrice;
               } else {
                  originalPrice = Number(stockPrice) || 0;
               }
            }
            return (
              <SellingListItem
                key={item.uniqueId}
                item={item}
                originalPrice={originalPrice}
                onPriceChange={(newPrice) => handlePriceChange(item, newPrice)}
                onRemove={() => handleRemoveItem(item)}
                onRenew={() => onRenewItem && onRenewItem(item.uniqueId, (item.productData as { productId?: string }).productId || item.productData._id || item.productId.toString())}
                isLoading={isLoading}
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
