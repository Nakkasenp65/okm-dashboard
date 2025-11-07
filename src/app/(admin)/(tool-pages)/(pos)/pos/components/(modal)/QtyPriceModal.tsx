"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

interface QtyPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  currentQty: number;
  currentUnitPrice: number;
  onConfirm: (addQty: number, newPrice: number) => void;
}

export default function QtyPriceModal({
  isOpen,
  onClose,
  productName,
  currentQty,
  currentUnitPrice,
  onConfirm,
}: QtyPriceModalProps) {
  const [addQty, setAddQty] = useState<number>(1);
  const [newPrice, setNewPrice] = useState<string>(currentUnitPrice.toString());

  const handleConfirm = () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0 || addQty < 1) {
      return;
    }
    onConfirm(addQty, price);
    handleClose();
  };

  const handleClose = () => {
    setAddQty(1);
    setNewPrice(currentUnitPrice.toString());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
            จัดการจำนวนและราคา
          </h4>
          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {productName}
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            จำนวนปัจจุบัน: <span className="font-bold">{currentQty} ชิ้น</span>
          </p>
        </div>

        {/* Add Quantity Section */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            จำนวนที่จะเพิ่ม (ชิ้น)
          </label>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="h-10 w-10 rounded-full p-0 text-lg"
              onClick={() => setAddQty(Math.max(1, addQty - 1))}
            >
              −
            </Button>
            <input
              type="number"
              value={addQty}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setAddQty(Math.max(1, val));
              }}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-lg font-bold transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              min="1"
            />
            <Button
              size="sm"
              className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 p-0 text-lg hover:from-green-600 hover:to-emerald-700"
              onClick={() => setAddQty(addQty + 1)}
            >
              +
            </Button>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            ราคาต่อชิ้น (บาท)
          </label>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            step="0.01"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg font-bold transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="0.00"
          />
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                ราคารวม:
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ฿{(addQty * parseFloat(newPrice || "0")).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                จำนวนเดิม:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentQty} ชิ้น
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                จำนวนใหม่:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentQty + addQty} ชิ้น
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 font-semibold"
            onClick={handleClose}
          >
            ยกเลิก
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 font-semibold hover:from-green-600 hover:to-emerald-700"
            onClick={handleConfirm}
          >
            ✓ ยืนยัน
          </Button>
        </div>
      </div>
    </Modal>
  );
}
