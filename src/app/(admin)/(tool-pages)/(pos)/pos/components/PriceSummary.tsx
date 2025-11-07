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
}

const PriceSummary: React.FC<PriceSummaryProps> = ({
  items,
  vatRate = 0.07,
  serviceCharge,
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
      <div className="rounded-lg dark:from-blue-950/20 dark:to-indigo-950/20">
        {/* ราคาสินค้า */}
        <div className="flex items-center justify-between">
          <span className="text-xl text-gray-700 dark:text-gray-300">
            ราคาสินค้า
          </span>
          <span className="text-xl text-gray-900 dark:text-white">
            ฿{subtotal.toFixed(2)}
          </span>
        </div>

        {/* VAT */}
        <div className="flex items-center justify-between text-xl dark:border-blue-800/50">
          <span className="text-xl text-gray-700 dark:text-gray-300">
            VAT ({(vatRate * 100).toFixed(0)}%)
          </span>
          <span className="text-xl text-gray-900 dark:text-white">
            ฿{vat.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xl">
          <span>ยอดรวมทั้งสิ้น</span>
          <span>฿{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-2 flex justify-center">
        <Button
          variant="primary"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-3 text-base font-bold shadow-lg transition-all hover:from-purple-600 hover:to-pink-700 hover:shadow-xl"
          onClick={() => window.print()}
        >
          พิมพ์ใบเสร็จ
        </Button>
      </div>
    </div>
  );
};

export default PriceSummary;
