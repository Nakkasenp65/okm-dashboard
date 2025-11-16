"use client";
import React from "react";
import Button from "@/components/ui/button/Button";
import { FaPrint, FaShareAlt } from "react-icons/fa";

interface SuccessScreenProps {
  changeAmount: number;
  onFinishTransaction: () => void;
  onPrintShortReceipt: () => void; // Prop นี้ยังคงอยู่ แต่อิงตามโค้ดเดิมที่ไม่มีปุ่ม
  onPrintFullReceipt: () => void;
  onSendEReceipt: () => void;
}

export default function SuccessScreen({
  changeAmount,
  onFinishTransaction,
  onPrintFullReceipt,
  onSendEReceipt,
}: SuccessScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4 text-center md:p-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
        <span className="text-4xl text-green-500">✓</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        ชำระเงินสำเร็จ
      </h2>

      {changeAmount > 0 && (
        <>
          <p className="text-lg text-gray-500 dark:text-gray-400">เงินทอน</p>
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
            ฿
            {changeAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </>
      )}

      <div className="my-4 w-full max-w-lg border-t border-gray-200 dark:border-gray-700"></div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-4">
        {/* Grid for Receipt Options */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onPrintFullReceipt}
            className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg p-4 text-base md:h-36 md:text-lg"
          >
            <FaPrint className="mb-1 text-3xl md:text-4xl" />
            <span>พิมพ์ใบเสร็จ</span>
          </Button>
          <Button
            variant="outline"
            onClick={onSendEReceipt}
            className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg p-4 text-base md:h-36 md:text-lg"
          >
            <FaShareAlt className="mb-1 text-3xl md:text-4xl" />
            <span>ส่ง E-Receipt</span>
          </Button>
        </div>

        {/* Finish Button */}
        <Button
          onClick={onFinishTransaction}
          className="w-full rounded-lg py-5 text-lg font-semibold md:py-6 md:text-xl"
        >
          เสร็จสิ้นรายการ
        </Button>
      </div>
    </div>
  );
}
