"use client";
import React, { useCallback, useMemo } from "react";
import PriceSummary from "@/app/(admin)/(tool-pages)/(pos)/pos/components/PriceSummary";
import SelectedProductsTable, { PosItem } from "./SelectedProductsTable";
import { usePosMockData } from "./usePosMockData";
import ComponentCard from "../../../../../../components/common/ComponentCard";
import Image from "next/image";

interface SellingDetailsProps {
  selectedProducts: PosItem[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<PosItem[]>>;
}

export default function SellingDetails({
  selectedProducts,
  setSelectedProducts,
}: SellingDetailsProps) {
  // Fetch available products (for future add/selection workflows)
  const { loading, error } = usePosMockData();

  // Update quantity handler
  const updateQty = useCallback(
    (id: number, delta: number) => {
      setSelectedProducts((prev) =>
        prev
          .map((p) =>
            p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p,
          )
          .filter((p) => p.qty > 0),
      );
    },
    [setSelectedProducts],
  );

  // Remove item handler
  const removeItem = useCallback(
    (id: number) => {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    },
    [setSelectedProducts],
  );

  const summaryItems = useMemo(() => selectedProducts, [selectedProducts]);

  return (
    <ComponentCard
      title="รายละเอียดการขาย"
      className="flex flex-col gap-3 rounded-lg bg-white lg:gap-4"
    >
      {/* Selected Products Table */}
      <div className="flex flex-1 flex-col">
        {/* Optional inline status for data fetching */}
        {loading && (
          <div className="mb-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            ⏳ กำลังโหลดข้อมูลสินค้า...
          </div>
        )}

        {error && (
          <div className="mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            ❌ เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
          </div>
        )}

        {/* ตารางสินค้าที่เลือกเข้ามาแล้ว */}
        <SelectedProductsTable
          items={selectedProducts}
          onUpdateQty={updateQty}
          onRemove={removeItem}
        />

        {selectedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-12 dark:border-gray-700">
            <Image
              src="/images/assets/empty-cart.png"
              alt="Empty Cart"
              width={100}
              height={100}
              className="w-24 opacity-10"
            />
            <p className="mt-2 text-2xl font-medium text-gray-200 dark:text-gray-400">
              ยังไม่มีสินค้าในตะกร้า
            </p>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="flex flex-col">
        <PriceSummary items={summaryItems} vatRate={0.07} serviceCharge={0} />
      </div>
    </ComponentCard>
  );
}
