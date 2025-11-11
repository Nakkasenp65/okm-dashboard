"use client";
import React from "react";
import { GroupedProduct, SubItem } from "../page";
import SellingListItem from "./SellingListItem"; // New component

interface SellingListProps {
  selectedProductsMap: Map<number, GroupedProduct>;
  onUpdateCart: (productId: number, updatedItems: SubItem[]) => void;
}

export default function SellingList({
  selectedProductsMap,
  onUpdateCart,
}: SellingListProps) {
  // Flatten the map into a single list of all items for rendering
  const allItems = Array.from(selectedProductsMap.values()).flatMap(
    (group) => group.items,
  );

  const handlePriceChange = (itemToUpdate: SubItem, newPrice: number) => {
    const group = selectedProductsMap.get(itemToUpdate.productId);
    if (!group) return;

    const updatedItems = group.items.map((item) =>
      item.uniqueId === itemToUpdate.uniqueId
        ? { ...item, unitPrice: newPrice }
        : item,
    );
    onUpdateCart(itemToUpdate.productId, updatedItems);
  };

  const handleRemoveItem = (itemToRemove: SubItem) => {
    const group = selectedProductsMap.get(itemToRemove.productId);
    if (!group) return;

    const updatedItems = group.items.filter(
      (item) => item.uniqueId !== itemToRemove.uniqueId,
    );
    onUpdateCart(itemToRemove.productId, updatedItems);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-2 flex border-b border-gray-200 pb-2 text-base font-semibold text-gray-500 uppercase dark:border-gray-700 dark:text-gray-400">
        <span className="flex-1">รายการ</span>
        <span className="w-24 text-center">ราคา</span>
        <span className="w-12 text-center">ลบ</span>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto">
        {allItems.length > 0 ? (
          allItems.map((item) => (
            <SellingListItem
              key={item.uniqueId}
              item={item}
              onPriceChange={(newPrice) => handlePriceChange(item, newPrice)}
              onRemove={() => handleRemoveItem(item)}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-gray-500 dark:text-gray-400">
              ยังไม่มีสินค้าในรายการ
              <br />
              เพิ่มสินค้าเพื่อเริ่มต้นการขาย
            </p>
          </div>
        )}
      </div>
    </>
  );
}
