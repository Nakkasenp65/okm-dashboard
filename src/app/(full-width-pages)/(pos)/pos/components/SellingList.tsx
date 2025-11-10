"use client";
import React from "react";
import { GroupedProduct, SubItem } from "../page";
import SelectedProductComponent from "./SelectedProductComponent";

interface SellingListProps {
  selectedProductsMap: Map<number, GroupedProduct>;
  onUpdateCart: (productId: number, updatedItems: SubItem[]) => void;
}

export default function SellingList({
  selectedProductsMap,
  onUpdateCart,
}: SellingListProps) {
  const productGroups = Array.from(selectedProductsMap.values());

  return (
    <>
      <div className="mb-2 flex border-b border-gray-200 pb-2 text-xs font-semibold text-gray-500 uppercase dark:border-gray-700 dark:text-gray-400">
        <span className="flex-1">รายการ</span>
        <span className="w-16 text-center">จำนวน</span>
        <span className="w-24 text-right">ราคา</span>
        <span className="w-16 text-center">แก้ไข</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {productGroups.length > 0 ? (
          productGroups.map((group) => (
            <SelectedProductComponent
              key={group.productId}
              group={group}
              onUpdate={onUpdateCart}
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
