"use client";
import React, { useState } from "react";
import {
  FaCashRegister,
  FaTag,
  FaTrashCan,
  FaUser,
  FaBoxArchive,
  FaLock,
} from "react-icons/fa6";
import CustomerModal, { Customer } from "./(modal)/CustomerModal";
import DiscountModal, { Discount } from "./(modal)/DiscountModal";
import CashDrawerModal, { CashDrawerActivity } from "./(modal)/CashDrawerModal";
import SummaryModal, { StaffMember } from "./(modal)/SummaryModal";

import { SelectedItem } from "../page";

interface SidebarMenuProps {
  selectedProducts: SelectedItem[];
  setSelectedProducts: () => void;
  onCustomerSelect: (customer: Customer | null) => void;
  currentCustomer: Customer | null;
  appliedDiscounts: Discount[];
  onDiscountsChange: (discounts: Discount[]) => void;
  onCashDrawerActivity: (activity: CashDrawerActivity) => void;
  onLockScreen: () => void;
  subtotal: number;
  total: number;
  billIssuers: StaffMember[];
  currentIssuer: StaffMember;
}

export default function SidebarMenu({
  selectedProducts,
  setSelectedProducts,
  onCustomerSelect,
  currentCustomer,
  appliedDiscounts,
  onDiscountsChange,
  onCashDrawerActivity,
  onLockScreen,
  subtotal,
  total,
  billIssuers,
  currentIssuer,
}: SidebarMenuProps) {
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [isCashDrawerModalOpen, setCashDrawerModalOpen] = useState(false);
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);

  // [CHIRON'S REFACTOR] 2. สร้าง Handler เพื่อเปิด Customer Modal
  // ฟังก์ชันนี้จะถูกส่งลงไปให้ SummaryModal เพื่อใช้เรียกกลับ
  const handleOpenCustomerSearch = () => {
    setSummaryModalOpen(false); // ปิด SummaryModal ก่อน
    setCustomerModalOpen(true); // แล้วค่อยเปิด CustomerModal
  };

  const handleClearCart = () => {
    if (
      window.confirm(
        "คุณต้องการล้างข้อมูลการขายทั้งหมดหรือไม่? (สินค้า, ลูกค้า, ส่วนลด)",
      )
    ) {
      setSelectedProducts(); // เรียกฟังก์ชันเคลียร์ตะกร้าจาก Page
      onCustomerSelect(null);
      onDiscountsChange([]);
    }
  };

  return (
    <>
      <div
        id="pos-selling-action-nav-section"
        className="flex w-16 flex-col bg-gray-900"
      >
        <button
          onClick={() => setCustomerModalOpen(true)}
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
          onClick={() => setSummaryModalOpen(true)}
          className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
        >
          <FaCashRegister size={24} color="white" />
          <span className="mt-1 text-xs text-white">สรุป</span>
        </button>

        <button
          onClick={handleClearCart}
          className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
        >
          <FaTrashCan size={24} color="white" />
          <span className="mt-1 text-xs text-white">เคลียร์</span>
        </button>

        {/* Lock Button */}
        <button
          onClick={onLockScreen}
          className="flex h-20 w-full flex-col items-center justify-center rounded-md transition-colors hover:bg-red-700"
          title="ล็อค POS ระบบ"
        >
          <FaLock size={24} color="white" />
          <span className="mt-1 text-xs text-white">ล็อค</span>
        </button>
      </div>

      {/* Render Modals ทั้งหมด */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSelectCustomer={onCustomerSelect}
      />
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

      {/* [CHIRON'S REFACTOR] 3. ส่ง onOpenCustomerSearch ลงไปใน SummaryModal */}
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        onOpenCustomerSearch={handleOpenCustomerSearch}
        items={selectedProducts}
        customer={currentCustomer}
        discounts={appliedDiscounts}
        subtotal={subtotal}
        total={total}
        billIssuers={billIssuers}
        currentIssuer={currentIssuer}
      />
    </>
  );
}
