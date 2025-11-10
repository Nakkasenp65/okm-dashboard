"use client";

import React from "react";
import Button from "../../../../../../components/ui/button/Button";
import { Modal } from "../../../../../../components/ui/modal";

type RawProduct = {
  id: number;
  name: string;
  prices: {
    level_1: string;
  };
  category?: {
    id: number;
    color: string;
    name: string;
  };
  unit?: {
    id: number;
    name: string;
  };
  barcode?: string;
};

interface QuantitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: RawProduct | null;
  quantity: number;
  setQuantity: (qty: number) => void;
  onConfirm: () => void;
}

export default function QuantitySelectionModal({
  isOpen,
  onClose,
  selectedProduct,
  quantity,
  setQuantity,
  onConfirm,
}: QuantitySelectionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        {selectedProduct && (
          <>
            <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                ระบุจำนวนเพิ่ม
              </h4>
              <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedProduct.name}
              </p>
              {selectedProduct.category && (
                <span
                  className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{
                    backgroundColor: selectedProduct.category.color,
                  }}
                >
                  {selectedProduct.category.name}
                </span>
              )}
              <p className="mt-3 text-base font-bold text-green-600 dark:text-green-400">
                ฿{Number(selectedProduct.prices?.level_1 ?? 0).toFixed(2)} /{" "}
                {selectedProduct.unit?.name || "ชิ้น"}
              </p>
            </div>

            {/* Quantity Input */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                จำนวนที่ต้องการเพิ่ม:
              </label>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 w-10 rounded-full p-0 text-lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </Button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, val));
                  }}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-lg font-bold transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  min="1"
                />
                <Button
                  size="sm"
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 p-0 text-lg hover:from-green-600 hover:to-emerald-700"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  รวมทั้งสิ้น:
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ฿
                  {(
                    Number(selectedProduct.prices?.level_1 ?? 0) * quantity
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 font-semibold"
                onClick={onClose}
              >
                ยกเลิก
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 font-semibold hover:from-green-600 hover:to-emerald-700"
                onClick={onConfirm}
              >
                ✓ ยืนยันเพิ่มสินค้า
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
