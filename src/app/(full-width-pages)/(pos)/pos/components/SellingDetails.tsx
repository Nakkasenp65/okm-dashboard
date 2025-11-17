"use client";
import React from "react";
import ProductCategory from "./ProductCategory";
import { Product } from "../types/Pos"; // Import Product type

// **KEY CHANGE: ปรับปรุง Props Interface - ลบ availableProducts, isLoading, error ออก**
// เพราะ ProductCategory จะดึงข้อมูลเองผ่าน useProducts hook
interface SellingDetailsProps {
  onAddProduct: (productToAdd: Product) => void;
  availableStock: Map<number, number>;
}

export default function SellingDetails({ onAddProduct, availableStock }: SellingDetailsProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Container หลักที่ยืดหยุ่นตามความสูง */}
      <div className="flex flex-1 flex-col">
        {/* ProductCategory จะจัดการ loading และ error states เอง */}
        <ProductCategory onAddProduct={onAddProduct} availableStock={availableStock} />
      </div>
    </div>
  );
}
