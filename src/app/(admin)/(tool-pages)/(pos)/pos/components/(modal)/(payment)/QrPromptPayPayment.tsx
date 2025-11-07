"use client";
import React from "react";
import PaymentActions from "./PaymentAction";

interface PaymentViewProps {
  totalAmount: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function QrPromptPayPayment({
  totalAmount,
  onConfirm,
  onBack,
}: PaymentViewProps) {
  const handleConfirm = () => {
    alert("ชำระเงินผ่าน QR PromptPay สำเร็จ!");
    window.print();
    onConfirm();
  };

  return (
    <>
      <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
          📱 QR PromptPay
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          สแกน QR Code เพื่อชำระเงิน
        </p>
      </div>

      <div className="space-y-2 rounded-lg bg-gray-50 p-6 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            ยอดที่ต้องชำระ
          </span>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            ฿{totalAmount}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-12 dark:border-blue-700 dark:bg-blue-950/30">
        <div className="text-6xl">📲</div>
        <p className="mt-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
          QR Code PromptPay
        </p>
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          สแกนด้วยแอปพลิเคชันของคุณ
        </p>
      </div>

      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          ⏳ รอการชำระเงิน...
        </p>
        <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
          กรุณารอให้ลูกค้าสแกน QR Code
        </p>
      </div>

      <PaymentActions
        onBack={onBack}
        onConfirm={handleConfirm}
        confirmButtonClass="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
      />
    </>
  );
}
