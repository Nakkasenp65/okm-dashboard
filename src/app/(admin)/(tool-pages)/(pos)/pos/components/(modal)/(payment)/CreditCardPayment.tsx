"use client";
import React from "react";
import PaymentActions from "./PaymentAction";

interface PaymentViewProps {
  totalAmount: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function CreditCardPayment({
  totalAmount,
  onConfirm,
  onBack,
}: PaymentViewProps) {
  const handleConfirm = () => {
    alert("ชำระเงินผ่านบัตรสำเร็จ!");
    window.print();
    onConfirm();
  };

  return (
    <>
      <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
          💳 บัตรเครดิต/เดบิต
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          ยืนยันการชำระเงินด้วยบัตร
        </p>
      </div>

      <div className="space-y-2 rounded-lg bg-gray-50 p-6 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            ยอดที่ต้องชำระ
          </span>
          <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            ฿{totalAmount}
          </span>
        </div>
      </div>

      <div className="rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
        <p className="text-sm font-semibold">DEBIT / CREDIT CARD</p>
        <p className="mt-4 text-2xl tracking-widest">•••• •••• •••• 1234</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-200">Card Holder</p>
            <p className="font-semibold">Customer</p>
          </div>
          <div>
            <p className="text-xs text-purple-200">Expires</p>
            <p className="font-semibold">12/26</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
          ⏳ ประมวลผลการชำระเงิน...
        </p>
        <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
          กรุณารอให้ระบบประมวลผล
        </p>
      </div>

      <PaymentActions
        onBack={onBack}
        onConfirm={handleConfirm}
        confirmButtonClass="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
      />
    </>
  );
}
