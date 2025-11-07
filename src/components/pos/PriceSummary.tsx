"use client";
import React, { useMemo } from "react";
import Button from "@/components/ui/button/Button";

type Item = {
  id: number;
  name: string;
  unitPrice: number;
  qty: number;
};

interface PriceSummaryProps {
  items: Item[];
  vatRate?: number; // e.g., 0.07 for 7%
  serviceCharge: number;
  onServiceChargeChange: (value: number) => void;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({
  items,
  vatRate = 0.07,
  serviceCharge,
  onServiceChargeChange,
}) => {
  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  }, [items]);

  const vat = useMemo(() => {
    return subtotal * vatRate;
  }, [subtotal, vatRate]);

  const total = useMemo(() => {
    return subtotal + vat + (serviceCharge || 0);
  }, [subtotal, vat, serviceCharge]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ราคาสินค้า
          </span>
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            ฿{subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-blue-200/50 py-2 dark:border-blue-800/50">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            VAT ({(vatRate * 100).toFixed(0)}%)
          </span>
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            ฿{vat.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-blue-200/50 py-2 dark:border-blue-800/50">
          <label
            htmlFor="serviceCharge"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            ค่าบริการ
          </label>
          <input
            id="serviceCharge"
            type="number"
            min={0}
            step={0.01}
            value={Number.isFinite(serviceCharge) ? serviceCharge : 0}
            onChange={(e) => onServiceChargeChange(Number(e.target.value))}
            className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-right text-sm font-semibold transition-colors focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-white">
            💰 ยอดรวมทั้งสิ้น
          </span>
          <span className="text-2xl font-bold text-white">
            ฿{total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex justify-center">
        <Button
          variant="primary"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-3 text-base font-bold shadow-lg transition-all hover:from-purple-600 hover:to-pink-700 hover:shadow-xl"
          onClick={() => window.print()}
        >
          🖨️ พิมพ์ใบเสร็จ
        </Button>
      </div>
    </div>
  );
};

export default PriceSummary;
