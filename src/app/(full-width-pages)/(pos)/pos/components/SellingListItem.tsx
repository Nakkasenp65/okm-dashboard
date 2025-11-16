"use client";
import React from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { SubItem } from "../page";
import ConfirmationModal from "./(modal)/ConfirmationModal";
import { useConfirmation } from "../hooks/useConfirmation";

interface SellingListItemProps {
  item: SubItem;
  originalPrice: number;
  onPriceChange: (newPrice: number) => void;
  onRemove: () => void;
}

export default function SellingListItem({
  item,
  originalPrice,
  onPriceChange,
  onRemove,
}: SellingListItemProps) {
  const confirmation = useConfirmation();
  const isDiscounted = item.unitPrice < originalPrice;

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
    // Container: แสดงเป็น Card ในจอเล็กกว่า lg และเปลี่ยนเป็น Grid row ในจอ lg ขึ้นไป
    <div className="mb-3 rounded-lg border bg-white p-4 shadow-sm xl:mb-0 xl:grid xl:grid-cols-12 xl:items-center xl:gap-2 xl:rounded-none xl:border-0 xl:border-b xl:border-gray-100 xl:bg-transparent xl:p-0 xl:py-2 xl:shadow-none dark:border-gray-700 dark:bg-gray-800 xl:dark:border-gray-700/50 xl:dark:bg-transparent">
      {/* Section 1: Item Name and IMEI */}
      {/* On Desktop: ใช้ 6/12 ส่วน */}
      <div className="xl:col-span-6">
        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
          {item.name}
        </p>
        {item.imei && (
          <p className="mt-0.5 text-base font-bold text-gray-500 dark:text-gray-400">
            IMEI/SN: {item.imei}
          </p>
        )}
      </div>

      {/* Section 2: Prices and Actions */}
      {/* On Mobile/Tablet: เป็น flex container */}
      {/* On Desktop: ใช้ xl:contents เพื่อให้ children ของมันกลายเป็น grid items โดยตรง */}
      <div className="mt-4 flex items-end justify-between xl:mt-0 xl:contents">
        {/* Column 2: Original Price (2/12 ส่วนบน Desktop) */}
        <div className="xl:col-span-2 xl:text-right">
          <label className="block text-xs text-gray-500 xl:hidden">
            ราคาปลีก
          </label>
          <span
            className={`text-lg font-semibold ${
              isDiscounted
                ? "text-gray-400 line-through dark:text-gray-500"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {originalPrice.toFixed(2)}
          </span>
        </div>

        {/* Column 3: Selling Price Input (3/12 ส่วนบน Desktop) */}
        <div className="xl:col-span-3 xl:px-4">
          <label className="block text-xs text-gray-500 xl:hidden">
            ราคาขาย
          </label>
          <input
            inputMode="numeric"
            value={item.unitPrice}
            onChange={handlePriceInputChange}
            className={`w-28 rounded-md border text-center text-lg font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 xl:w-full ${
              isDiscounted
                ? "border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/50 dark:text-red-300"
                : "border-gray-300 bg-white text-blue-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            }`}
            placeholder="0.00"
          />
        </div>

        {/* Column 4: Remove Item Button (1/12 ส่วนบน Desktop) */}
        <div className="xl:col-span-1 xl:flex xl:items-center xl:justify-center">
          <button
            onClick={handleRemoveClick}
            className="p-2 text-gray-400 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
            aria-label={`Remove ${item.name}`}
          >
            <FaRegTrashAlt size={18} />
          </button>
        </div>
      </div>

      {/* Modal: Confirmation for removal (ไม่มีผลกับการแสดงผล) */}
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
