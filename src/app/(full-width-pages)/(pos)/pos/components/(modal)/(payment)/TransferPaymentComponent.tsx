"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaCopy, FaRegCheckCircle, FaArrowLeft } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import Button from "@/components/ui/button/Button";
import { BANK_DATA, Bank } from "@/data/BANK_DATA"; // 1. IMPORT ข้อมูลและ Type

// --- Mock Data ---
// [CHIRON'S NOTE] ข้อมูลส่วนนี้ยังคงเป็น Mock สำหรับแสดงผล แต่สามารถปรับเปลี่ยนให้ดึงตามธนาคารที่เลือกได้ในอนาคต
const MOCK_ACCOUNT_DETAILS = {
  accountName: "บริษัท พอสพอส จำกัด (POSPOS Co., Ltd.)",
  accountNumber: "123-4-56789-0",
  qrCodeUrl:
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=promptpay-0812345678-amount-",
};

// --- Props Interface ---
interface TransferPaymentComponentProps {
  totalToPay: number;
}

// --- Component Definition ---
export default function TransferPaymentComponent({
  totalToPay,
}: TransferPaymentComponentProps) {
  // --- STATE MANAGEMENT ---
  // 2. State สำหรับเก็บธนาคารที่ผู้ใช้เลือก (เริ่มต้นเป็น null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "checking" | "verified"
  >("pending");
  const [isCopied, setIsCopied] = useState(false);

  // --- LIFECYCLE ---
  // 3. ปรับปรุง useEffect ให้ reset สถานะทั้งหมด รวมถึงธนาคารที่เลือก
  useEffect(() => {
    setPaymentStatus("pending");
    setIsCopied(false);
    setSelectedBank(null); // ทำให้ผู้ใช้ต้องเลือกธนาคารใหม่ทุกครั้งที่เปิด Modal
  }, [totalToPay]);

  // --- EVENT HANDLERS ---
  const handleCopyAccNumber = () => {
    navigator.clipboard.writeText(
      MOCK_ACCOUNT_DETAILS.accountNumber.replace(/-/g, ""),
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCheckPayment = () => {
    setPaymentStatus("checking");
    setTimeout(() => setPaymentStatus("verified"), 2500);
  };

  // --- SUB-COMPONENTS RENDER ---

  /**
   * 4. สร้าง Component สำหรับหน้า "เลือกธนาคาร"
   *    ส่วนนี้จะแสดงเมื่อยังไม่มีการเลือกธนาคาร (selectedBank === null)
   */
  const renderBankSelection = () => (
    <div className="flex h-full w-full flex-col">
      <h3 className="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
        กรุณาเลือกธนาคารที่ลูกค้าโอน
      </h3>
      <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-1 md:grid-cols-4 lg:grid-cols-5">
        {BANK_DATA.map((bank) => (
          <button
            key={bank.short_name_en}
            onClick={() => setSelectedBank(bank)}
            className="group flex flex-col items-center justify-center gap-2 rounded-lg border bg-white p-3 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
          >
            <Image
              src={bank.logo_url}
              alt={`${bank.name_th} logo`}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-contain"
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {bank.name_th}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  /**
   * 5. สร้าง Component สำหรับหน้า "แสดงรายละเอียดการโอน"
   *    ส่วนนี้จะแสดงหลังจากผู้ใช้เลือกธนาคารแล้ว
   */
  const renderPaymentDetails = () => (
    <div className="flex h-full flex-col items-center justify-center p-4">
      {/* ปุ่มสำหรับย้อนกลับไปเลือกธนาคารใหม่ */}
      <button
        onClick={() => setSelectedBank(null)}
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
      >
        <FaArrowLeft />
        เปลี่ยนธนาคาร
      </button>

      <div className="flex items-center gap-3">
        <Image
          src={selectedBank!.logo_url}
          alt={`${selectedBank!.name_th} logo`}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {selectedBank!.name_th}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {MOCK_ACCOUNT_DETAILS.accountName}
          </p>
        </div>
      </div>

      <div className="my-6 text-center">
        <p className="text-sm text-gray-500 uppercase dark:text-gray-400">
          ยอดที่ต้องชำระ
        </p>
        <p className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          ฿{totalToPay.toFixed(2)}
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
        <Image
          src={`${MOCK_ACCOUNT_DETAILS.qrCodeUrl}${totalToPay.toFixed(2)}`}
          alt="Payment QR Code"
          width={200}
          height={200}
        />
      </div>

      <div className="mt-6">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          หรือโอนเข้าบัญชี
        </p>
        <div
          onClick={handleCopyAccNumber}
          className="mt-2 flex cursor-pointer items-center gap-2 rounded-full bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <span className="font-mono text-lg font-semibold text-gray-800 dark:text-gray-200">
            {MOCK_ACCOUNT_DETAILS.accountNumber}
          </span>
          {isCopied ? (
            <FaRegCheckCircle className="text-green-500" />
          ) : (
            <FaCopy className="text-gray-500" />
          )}
        </div>
        {isCopied && (
          <p className="mt-1 text-center text-xs text-green-600">คัดลอกแล้ว!</p>
        )}
      </div>

      <div className="mt-8 w-full max-w-xs">
        {paymentStatus === "pending" && (
          <Button
            onClick={handleCheckPayment}
            className="w-full py-3 text-base"
          >
            ตรวจสอบยอดเงิน
          </Button>
        )}
        {paymentStatus === "checking" && (
          <Button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 py-3 text-base"
          >
            <CgSpinner className="animate-spin text-xl" />
            กำลังตรวจสอบ...
          </Button>
        )}
        {paymentStatus === "verified" && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-green-100 p-3 text-center text-green-700 dark:bg-green-900/50 dark:text-green-300">
            <FaRegCheckCircle className="text-2xl" />
            <p className="font-semibold">ตรวจสอบสำเร็จ!</p>
            <p className="text-xs">
              กรุณากด &quot;ยืนยันการชำระเงิน&quot; เพื่อปิดการขาย
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  // 6. ใช้ Conditional Rendering เพื่อเลือกว่าจะแสดงหน้าไหน
  return (
    <div className="relative h-full">
      {!selectedBank ? renderBankSelection() : renderPaymentDetails()}
    </div>
  );
}
