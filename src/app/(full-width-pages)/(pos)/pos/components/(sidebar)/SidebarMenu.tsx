"use client";
import React from "react";
import {
  FaCashRegister,
  FaTag,
  FaTrashCan,
  FaUser,
  FaBoxArchive,
  FaLock,
  FaBuilding,
} from "react-icons/fa6";
// Note: ไม่ต้อง Import Modal หรือ Types ที่ไม่ได้ใช้ในการแสดงผลปุ่มแล้ว

interface SidebarMenuProps {
  // Action Triggers (ฟังก์ชันสั่งเปิด Modal จาก Parent)
  onOpenCustomerModal: () => void;
  onOpenDiscountModal: () => void;
  onOpenCashDrawerModal: () => void;
  onOpenSummaryModal: () => void;
  onOpenCompanyPayment: () => void;
  onClearCart: () => void;
  onLockScreen: () => void;
}

export default function SidebarMenu({
  onOpenCustomerModal,
  onOpenDiscountModal,
  onOpenCashDrawerModal,
  onOpenSummaryModal,
  onOpenCompanyPayment,
  onClearCart,
  onLockScreen,
}: SidebarMenuProps) {
  // logic ทั้งหมดถูกย้ายไปจัดการที่ Page.tsx ผ่าน Props

  return (
    <div
      id="pos-selling-action-nav-section"
      className="flex w-20 flex-col bg-gray-900"
    >
      {/* ปุ่มสมาชิก */}
      <button
        onClick={onOpenCustomerModal}
        className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
      >
        <FaUser size={24} color="white" />
        <span className="mt-1 text-xs text-white">สมาชิก</span>
      </button>

      {/* ปุ่มส่วนลด - เรียก prop แทนการ set local state */}
      <button
        onClick={onOpenDiscountModal}
        className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
      >
        <FaTag size={24} color="white" />
        <span className="mt-1 text-xs text-white">ส่วนลด</span>
      </button>

      {/* ปุ่มลิ้นชัก - เรียก prop แทนการ set local state */}
      <button
        onClick={onOpenCashDrawerModal}
        className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
      >
        <FaBoxArchive size={24} color="white" />
        <span className="mt-1 text-xs text-white">ลิ้นชัก</span>
      </button>

      {/* ปุ่มพิมพ์ใบเสร็จ */}
      <button
        onClick={onOpenSummaryModal}
        className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
      >
        <FaCashRegister size={24} color="white" />
        <span className="mt-1 text-xs text-white">พิมพ์ใบเสร็จ</span>
      </button>

      {/* ปุ่มเคลียร์ตะกร้า */}
      <button
        onClick={onClearCart}
        className="flex h-20 w-full flex-col items-center justify-center rounded-md hover:bg-gray-700"
      >
        <FaTrashCan size={24} color="white" />
        <span className="mt-1 text-xs text-white">เคลียร์</span>
      </button>

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
  );
}