"use client";
import React from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { SubItem } from "../page";
import ConfirmationModal from "./(modal)/ConfirmationModal";
import { useConfirmation } from "../hooks/useConfirmation";

interface SellingListItemProps {
  item: SubItem;
  onPriceChange: (newPrice: number) => void;
  onRemove: () => void;
}

export default function SellingListItem({
  item,
  onPriceChange,
  onRemove,
}: SellingListItemProps) {
  const confirmation = useConfirmation();

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value);
    onPriceChange(isNaN(newPrice) ? 0 : newPrice);
  };

  const handleRemoveClick = () => {
    confirmation.showConfirmation({
      title: "ยืนยันการลบสินค้า",
      message: `ต้องการลบ "${item.name}" 1 ชิ้นใช่หรือไม่?`,
      type: "warning",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
      showCancel: true,
      onConfirm: () => {
        onRemove();
      },
    });
  };

  return (
    <div className="flex items-center gap-2 border-b border-gray-100 py-2 dark:border-gray-700/50">
      {/* Item Name & IMEI */}
      <div className="flex-1">
        <p className="font-medium text-gray-800 dark:text-gray-200">
          {item.name}
        </p>
        {item.imei && (
          <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
            IMEI/SN: {item.imei}
          </p>
        )}
      </div>

      {/* Price Input */}
      <div className="w-24">
        <input
          type="number"
          value={item.unitPrice}
          onChange={handlePriceInputChange}
          className="w-full rounded-md border border-gray-300 bg-white p-1 text-right text-base font-semibold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="0.00"
        />
      </div>

      {/* Remove Button */}
      <div className="flex w-12 items-center justify-center">
        <button
          onClick={handleRemoveClick}
          className="p-2 text-red-500 hover:text-red-700"
          aria-label={`Remove ${item.name}`}
        >
          <FaRegTrashAlt />
        </button>
      </div>

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.hideConfirmation}
        onConfirm={confirmation.config.onConfirm}
        title={confirmation.config.title}
        message={confirmation.config.message}
        type={confirmation.config.type}
        confirmText={confirmation.config.confirmText}
        cancelText={confirmation.config.cancelText}
        showCancel={confirmation.config.showCancel}
      />
    </div>
  );
}
