"use client";
import React, { useState } from "react";
import {
  FaCashRegister,
  FaTag,
  FaTrashCan,
  FaUser,
  FaBoxArchive,
  FaLock,
  FaBuilding,
} from "react-icons/fa6";
import { Customer } from "./(modal)/CustomerModal";
import DiscountModal, { Discount } from "./(modal)/DiscountModal";
import CashDrawerModal, { CashDrawerActivity } from "./(modal)/CashDrawerModal";
import ConfirmationModal from "./(modal)/ConfirmationModal";
import { useConfirmation } from "../hooks/useConfirmation";

interface SidebarMenuProps {
  onCustomerSelect: (customer: Customer | null) => void;
  currentCustomer: Customer | null;
  appliedDiscounts: Discount[];
  onDiscountsChange: (discounts: Discount[]) => void;
  onCashDrawerActivity: (activity: CashDrawerActivity) => void;
  onLockScreen: () => void;
  onOpenCompanyPayment: () => void;
  onOpenCustomerModal: () => void;
  onOpenSummaryModal: () => void;
  onClearCart: () => void;
}

export default function SidebarMenu({
  // onCustomerSelect,
  // currentCustomer,
  appliedDiscounts,
  onDiscountsChange,
  onCashDrawerActivity,
  onLockScreen,
  onOpenCompanyPayment,
  onOpenCustomerModal,
  onOpenSummaryModal,
  onClearCart,
}: SidebarMenuProps) {
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [isCashDrawerModalOpen, setCashDrawerModalOpen] = useState(false);

  const confirmation = useConfirmation();

  return (
    <>
      <div
        id="pos-selling-action-nav-section"
        className="flex w-20 flex-col bg-gray-900"
      >
        <button
          onClick={onOpenCustomerModal}
          className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
        >
          <FaUser size={24} color="white" />
          <span className="mt-1 text-xs text-white">สมาชิก</span>
        </button>

        <button
          onClick={() => setDiscountModalOpen(true)}
          className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
        >
          <FaTag size={24} color="white" />
          <span className="mt-1 text-xs text-white">ส่วนลด</span>
        </button>

        <button
          onClick={() => setCashDrawerModalOpen(true)}
          className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
        >
          <FaBoxArchive size={24} color="white" />
          <span className="mt-1 text-xs text-white">ลิ้นชัก</span>
        </button>

        <button
          onClick={onOpenSummaryModal}
          className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
        >
          <FaCashRegister size={24} color="white" />
          <span className="mt-1 text-xs text-white">สรุป</span>
        </button>

        <button
          onClick={onClearCart}
          className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
        >
          <FaTrashCan size={24} color="white" />
          <span className="mt-1 text-xs text-white">เคลียร์</span>
        </button>

        <div className="mt-auto">
          <button
            onClick={onOpenCompanyPayment}
            className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
            title="บันทึกรายรับอื่น ๆ"
          >
            <FaBuilding size={24} color="white" />
            <span className="mt-1 text-xs text-white">บริษัท</span>
          </button>

          <button
            onClick={onLockScreen}
            className="flex h-20 w-full flex-col items-center justify-center rounded-md transition-colors hover:bg-red-700"
            title="ล็อค POS ระบบ"
          >
            <FaLock size={24} color="white" />
            <span className="mt-1 text-xs text-white">ล็อค</span>
          </button>
        </div>
      </div>

      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        initialDiscounts={appliedDiscounts}
        onApplyDiscounts={onDiscountsChange}
      />
      <CashDrawerModal
        isOpen={isCashDrawerModalOpen}
        onClose={() => setCashDrawerModalOpen(false)}
        onConfirm={onCashDrawerActivity}
      />

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
    </>
  );
}
