"use client";
import React from "react";
import { FaUser, FaTag, FaCashRegister, FaPrint, FaBoxArchive } from "react-icons/fa6";

interface FooterComponentProps {
  onOpenCustomerModal: () => void;
  onOpenDiscountModal: () => void;
  onOpenCashDrawerModal: () => void;
  onOpenSummaryModal: () => void;
  onOpenRetailPayment: () => void;
}

export default function FooterComponent({
  onOpenCustomerModal,
  onOpenDiscountModal,
  onOpenCashDrawerModal,
  onOpenSummaryModal,
  onOpenRetailPayment,
}: FooterComponentProps) {
  return (
    // MARK: - Mobile Footer Actions
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-700 bg-gray-900 md:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        {/* Customer Button */}
        <button
          onClick={onOpenCustomerModal}
          className="flex flex-col items-center justify-center rounded-lg px-1 py-2 transition-colors hover:bg-gray-800"
        >
          <FaUser size={20} className="mb-1 text-white" />
          <span className="text-[10px] text-white">สมาชิก</span>
        </button>

        {/* Discount Button */}
        <button
          onClick={onOpenDiscountModal}
          className="flex flex-col items-center justify-center rounded-lg px-1 py-2 transition-colors hover:bg-gray-800"
        >
          <FaTag size={20} className="mb-1 text-white" />
          <span className="text-[10px] text-white">ส่วนลด</span>
        </button>

        {/* Cash Drawer Button */}
        <button
          onClick={onOpenCashDrawerModal}
          className="flex flex-col items-center justify-center rounded-lg px-1 py-2 transition-colors hover:bg-gray-800"
        >
          <FaCashRegister size={20} className="mb-1 text-white" />
          <span className="text-[10px] text-white">ลิ้นชัก</span>
        </button>

        {/* Print/Summary Button */}
        <button
          onClick={onOpenSummaryModal}
          className="flex flex-col items-center justify-center rounded-lg px-1 py-2 transition-colors hover:bg-gray-800"
        >
          <FaPrint size={20} className="mb-1 text-white" />
          <span className="text-[10px] text-white">พิมพ์</span>
        </button>

        {/* Payment Button */}
        <button
          onClick={onOpenRetailPayment}
          className="flex flex-col items-center justify-center rounded-lg bg-blue-600 px-1 py-2 transition-colors hover:bg-blue-700"
        >
          <FaBoxArchive size={20} className="mb-1 text-white" />
          <span className="text-[10px] font-semibold text-white">ชำระ</span>
        </button>
      </div>
    </div>
  );
}