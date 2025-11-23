"use client";
import React, { useEffect, useState } from "react";
import { FaRegTrashAlt, FaClock, FaSync, FaEdit } from "react-icons/fa";
import { SubItem } from "../../page";
import ConfirmationModal from "../(modal)/ConfirmationModal";
import { useConfirmation } from "../../hooks/useConfirmation";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface SellingListItemProps {
  item: SubItem & { expiredAt?: string };
  originalPrice: number;
  onPriceChange: (newPrice: number) => void;
  onRemove: () => void;
  onRenew?: () => void;
  isLoading?: boolean;
}

export default function SellingListItem({
  item,
  originalPrice,
  onPriceChange,
  onRemove,
  onRenew,
  isLoading = false,
}: SellingListItemProps) {
  const confirmation = useConfirmation();
  const isDiscounted = item.unitPrice < originalPrice;
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  
  // Modal state for price editing on mobile/tablet
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [tempPrice, setTempPrice] = useState(item.unitPrice);

  const renderConditionLabel = () => {
    if (!item.productData?.condition) return null;

    const isNew = item.productData.condition === "new";

    return (
      <span
        className={`flex items-center rounded-lg px-2 py-0.5 text-sm ${isNew
          ? "bg-gradient-to-r from-green-500 to-green-600 text-white dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
          : "bg-gradient-to-r from-amber-500 to-amber-600 text-white dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
          }`}
      >
        {isNew ? "มือ 1" : "มือ 2"}
      </span>
    );
  };

  // Calculate time and render time state
  useEffect(() => {
    if (!item.expiredAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(item.expiredAt!).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        return "หมดเวลา";
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining === "หมดเวลา") {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [item.expiredAt]);

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

  const handleOpenPriceModal = () => {
    setTempPrice(item.unitPrice);
    setIsPriceModalOpen(true);
  };

  const handleSavePrice = () => {
    onPriceChange(tempPrice);
    setIsPriceModalOpen(false);
  };

  return (
    <div className="p-4 2xl:p-0 group relative mb-4 overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md 2xl:mb-0 2xl:grid 2xl:grid-cols-12 2xl:items-center 2xl:gap-1 2xl:rounded-none 2xl:border-0 2xl:border-b 2xl:border-gray-100 2xl:bg-transparent 2xl:py-4 2xl:shadow-none dark:border-gray-700 dark:bg-gray-800 2xl:dark:border-gray-700/50 2xl:dark:bg-transparent 2xl:hover:bg-gray-50/50 2xl:dark:hover:bg-gray-800/30">

      {/* Section 1: Item Details */}
      <div className="2xl:col-span-6 flex flex-col justify-center gap-1.5">
        <div className="flex flex-col items-start justify-start gap-2">

          {/* --- 2. ปรับ Layout ส่วนชื่อให้เรียงแนวนอนกับป้าย --- */}
          <div className="flex flex-wrap items-center gap-2">
            {renderConditionLabel()}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
              {item.name}
            </h3>
          </div>

          {/* Secondary Info: Category & Details */}
          {/* <div className="flex flex-wrap gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {item.productData?.category?.name && (
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {item.productData.category.name}
              </span>
            )}
          </div> */}

          {item.imei && (
            <div className="flex items-center gap-2">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-base font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                IMEI
              </span>
              <span className="font-mono text-base font-medium text-gray-600 dark:text-gray-300">
                {item.imei}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Pricing */}
      <div className="mt-4 flex items-center justify-between 2xl:mt-0 2xl:contents">
        {/* Original Price */}
        <div className="2xl:col-span-3 flex flex-col items-end 2xl:items-center justify-center">
          <span className="text-xs text-gray-400 mb-1 2xl:hidden">ราคาปลีก</span>
          <div className="flex flex-col items-end 2xl:items-center">
            <span
              className={`text-lg font-semibold tabular-nums tracking-tight ${isDiscounted
                ? "text-gray-400 line-through decoration-gray-400/50 dark:text-gray-600"
                : "text-gray-600 dark:text-gray-400"
                }`}
            >
              {originalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Selling Price - Desktop: Input, Mobile/Tablet: Button */}
        <div className="2xl:pl-4 2xl:col-span-3 flex flex-col items-end 2xl:items-center justify-center">
          <span className="text-xs text-gray-400 mb-1 2xl:hidden">ราคาขาย</span>
          
          {/* Mobile/Tablet/iPad: Button to open modal (below 1536px) */}
          <button
            onClick={handleOpenPriceModal}
            className="2xl:hidden flex items-center gap-2 rounded-lg border px-4 py-2 font-bold transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
            <FaEdit className="text-gray-500 dark:text-gray-400" size={14} />
            <span className={`text-lg ${isDiscounted ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
              ฿{item.unitPrice.toLocaleString()}
            </span>
          </button>

          {/* Large Desktop: Inline Input (1536px+) */}
          <div className="hidden 2xl:block relative w-full max-w-[140px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-400 font-sans">฿</span>
            </div>
            <input
              inputMode="numeric"
              value={item.unitPrice}
              onChange={handlePriceInputChange}
              className={`block w-full rounded-lg border-0 py-2 pl-7 pr-3 text-right text-lg font-bold ring-1 ring-inset transition-all focus:ring-2 focus:ring-inset ${isDiscounted
                ? "bg-red-50 text-red-600 ring-red-200 placeholder:text-red-300 focus:ring-red-500 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900/50"
                : "bg-gray-50 text-gray-900 ring-gray-200 placeholder:text-gray-400 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                }`}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 2xl:col-span-12 2xl:mt-0 2xl:border-t-0 2xl:pt-1">
        <div className="flex items-center min-h-[28px]">
          {item.expiredAt && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${isExpired
                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                }`}
            >
              <FaClock size={10} className={isExpired ? "animate-pulse" : ""} />
              <span className="tabular-nums tracking-wide">{timeLeft}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRenew}
            disabled={isLoading}
            className="group flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-all hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            title="ต่อเวลา (Renew)"
          >
            <FaSync
              size={12}
              className={`transition-transform group-hover:rotate-180 ${isLoading ? "animate-spin" : ""
                }`}
            />
            <span>ต่อเวลา</span>
          </button>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>

          <button
            onClick={handleRemoveClick}
            disabled={isLoading}
            className="group flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            title="ลบสินค้า"
          >
            <FaRegTrashAlt size={12} />
            <span>ลบ</span>
          </button>
        </div>
      </div>

      {/* Price Edit Modal (for mobile/tablet) */}
      <Modal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        className="max-w-md"
      >
        <div className="p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">แก้ไขราคาขาย</h3>
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.name}
            </label>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>ราคาปลีก:</span>
              <span className="font-semibold">฿{originalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ราคาขาย (บาท)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-gray-500 text-lg">฿</span>
              </div>
              <input
                type="number"
                inputMode="numeric"
                value={tempPrice}
                onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-right text-2xl font-bold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPriceModalOpen(false)}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSavePrice}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              บันทึก
            </Button>
          </div>
        </div>
      </Modal>

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