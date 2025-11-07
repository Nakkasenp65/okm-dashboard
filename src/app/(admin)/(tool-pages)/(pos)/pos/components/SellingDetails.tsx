"use client";
import React, { useCallback, useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PriceSummary from "@/components/pos/PriceSummary";
import SelectedProductsTable, { PosItem } from "./SelectedProductsTable";
import { usePosMockData } from "./usePosMockData";

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

  // Local state for items being sold
  const [serviceCharge, setServiceCharge] = useState<number>(0);

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
    <div className="flex flex-col gap-3 lg:gap-4">
      {/* Selected Products Table */}
      <div className="flex flex-1 flex-col">
        <ComponentCard
          title="รายการขาย"
          className="shadow-md transition-shadow hover:shadow-lg"
        >
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

          <SelectedProductsTable
            items={selectedProducts}
            onUpdateQty={updateQty}
            onRemove={removeItem}
          />

          {selectedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 dark:border-gray-700">
              <div className="text-4xl">🛒</div>
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                ยังไม่มีสินค้าในตะกร้า
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                เริ่มต้นโดยการเพิ่มสินค้า
              </p>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Price Summary */}
      <div className="flex flex-col">
        <ComponentCard
          title="ราคารวม"
          className="shadow-md transition-shadow hover:shadow-lg"
        >
          <PriceSummary
            items={summaryItems}
            vatRate={0.07}
            serviceCharge={serviceCharge}
            onServiceChargeChange={setServiceCharge}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
