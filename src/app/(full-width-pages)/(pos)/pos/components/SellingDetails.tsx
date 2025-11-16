"use client";
import React from "react";
import ProductCategory from "./ProductCategory";
import { Product } from "../types/Pos"; // Import Product type

// **KEY CHANGE: ปรับปรุง Props Interface ให้เรียบง่ายขึ้น**
// รับเฉพาะฟังก์ชัน onAddProduct และข้อมูลสำหรับ Catalog
interface SellingDetailsProps {
  onAddProduct: (productToAdd: Product) => void;
  availableProducts: Product[];
  availableStock: Map<number, number>;
  isLoading: boolean;
  error: string | null;
}

export default function SellingDetails({
  onAddProduct,
  availableProducts,
  availableStock,
  isLoading,
  error,
}: SellingDetailsProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Container หลักที่ยืดหยุ่นตามความสูง */}
      <div className="flex flex-1 flex-col">
        {isLoading && (
          <div className="flex h-full items-center justify-center rounded-lg bg-gray-50 p-3 text-lg text-blue-600 dark:bg-gray-900 dark:text-blue-400">
            ⏳ กำลังโหลดข้อมูลสินค้า...
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center rounded-lg bg-red-50 p-3 text-lg text-red-600 dark:bg-red-950/30 dark:text-red-400">
            ❌ เกิดข้อผิดพลาด: {error}
          </div>
        )}

        {/* เมื่อโหลดเสร็จและไม่มี error ให้แสดง Catalog */}
        {!isLoading && !error && (
          <ProductCategory
            onAddProduct={onAddProduct} // ส่ง onAddProduct ที่ได้รับมาลงไปตรงๆ
            products={availableProducts}
            availableStock={availableStock}
          />
        )}
      </div>
    </div>
  );
}
