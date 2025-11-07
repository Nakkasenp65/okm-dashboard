"use client";
import React from "react";
import PaymentActions from "./PaymentAction";

interface PaymentViewProps {
  totalAmount: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function CashPayment({
  totalAmount,
  onConfirm,
  onBack,
}: PaymentViewProps) {
  const handleConfirm = () => {
    window.print();
    alert("ชำระเงินสำเร็จ! รายการถูกปิดแล้ว");
    onConfirm();
  };

  return (
    <>
      <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
          💵 ชำระเงินสด
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          ยืนยันการชำระเงินสดและปิดรายการ
        </p>
      </div>

      <div className="space-y-2 rounded-lg bg-gray-50 p-6 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ราคาสินค้า
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ฿{totalAmount}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ยอดรวมทั้งสิ้น
            </span>
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              ฿{totalAmount}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
          ✓ ลูกค้าชำระเงินสดแล้ว
        </p>
        <p className="mt-2 text-xs text-green-600 dark:text-green-400">
          กรุณาเก็บเงิน {totalAmount} บาท
        </p>
      </div>

      <PaymentActions
        onBack={onBack}
        onConfirm={handleConfirm}
        confirmButtonClass="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
      />
    </>
  );
}
