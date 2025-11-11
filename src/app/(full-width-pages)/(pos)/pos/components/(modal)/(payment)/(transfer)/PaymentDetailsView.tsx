"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaCopy, FaRegCheckCircle, FaArrowLeft } from "react-icons/fa";
import type { BankAccount } from "./TransferPaymentComponent";

// --- PROPS INTERFACE ---
interface PaymentDetailsViewProps {
  account: BankAccount;
  totalToPay: number;
  onBack: () => void;
}

// --- COMPONENT DEFINITION ---
export default function PaymentDetailsView({
  account,
  totalToPay,
  onBack,
}: PaymentDetailsViewProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAccNumber = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.accountNumber.replace(/-/g, ""));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
      >
        <FaArrowLeft />
        กลับไปเลือกบัญชี
      </button>

      <div className="flex items-center gap-3">
        {account.logo_url ? (
          <Image
            src={account.logo_url}
            alt={`${account.name_th} logo`}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500 dark:bg-gray-600 dark:text-gray-300">
            {account.short_name_en.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {account.name_th}
          </p>
        </div>
      </div>

      <div className="mt-8 w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-6 text-center text-lg font-semibold text-gray-700 dark:text-gray-200">
          รายละเอียดการโอนเงิน
        </h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ชื่อบัญชี
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {account.accountName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              เลขที่บัญชี
            </p>
            <div
              onClick={handleCopyAccNumber}
              className="mt-1 flex cursor-pointer items-center justify-between rounded-lg bg-gray-100 p-3 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <span className="font-mono text-2xl font-bold tracking-wider text-gray-800 dark:text-gray-200">
                {account.accountNumber}
              </span>
              {isCopied ? (
                <FaRegCheckCircle className="text-xl text-green-500" />
              ) : (
                <FaCopy className="text-xl text-gray-500" />
              )}
            </div>
            {isCopied && (
              <p className="mt-2 text-center text-sm text-green-600">
                คัดลอกเลขที่บัญชีแล้ว!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-base text-gray-500 uppercase dark:text-gray-400">
          ยอดที่ต้องชำระ
        </p>
        <p className="text-5xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
          ฿{totalToPay.toFixed(2)}
        </p>
      </div>

      <div className="mt-auto w-full max-w-xs pt-6">
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-blue-100 p-3 text-center text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <p className="font-semibold">ลูกค้าต้องดำเนินการโอนเงิน</p>
          <p className="text-xs">
            เมื่อลูกค้าโอนสำเร็จแล้ว กรุณากด &quot;ยืนยันการชำระเงิน&quot;
            เพื่อปิดการขาย
          </p>
        </div>
      </div>
    </div>
  );
}
