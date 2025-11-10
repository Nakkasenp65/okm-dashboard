"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaArrowLeft, FaRegCheckCircle } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import {
  ONLINE_PAYMENT_DATA,
  OnlinePaymentMethod,
} from "@/data/ONLINE_PAYMENT_DATA";
import Button from "@/components/ui/button/Button";

interface OnlinePaymentComponentProps {
  totalToPay: number;
}

export default function OnlinePaymentComponent({
  totalToPay,
}: OnlinePaymentComponentProps) {
  // 1. State สำหรับจัดการ UI: ช่องทางที่เลือก และสถานะการชำระเงิน
  const [selectedMethod, setSelectedMethod] =
    useState<OnlinePaymentMethod | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "checking" | "verified"
  >("pending");

  // 2. Reset สถานะทั้งหมดเมื่อ Modal ถูกเปิดใหม่ (สังเกตจาก totalToPay ที่เปลี่ยน)
  useEffect(() => {
    setSelectedMethod(null);
    setPaymentStatus("pending");
  }, [totalToPay]);

  const handleCheckPayment = () => {
    setPaymentStatus("checking");
    setTimeout(() => {
      setPaymentStatus("verified");
    }, 2500); // จำลองการเรียก API
  };

  // 3. Sub-Component สำหรับแสดง "หน้าเลือกช่องทาง"
  const renderSelection = () => (
    <div className="flex h-full w-full flex-col p-4">
      <h3 className="mb-4 shrink-0 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
        เลือกช่องทางชำระเงินออนไลน์
      </h3>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {ONLINE_PAYMENT_DATA.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method)}
            className="flex w-full items-center gap-4 rounded-lg border bg-white p-3 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
          >
            <Image
              src={method.logo_url}
              alt={`${method.name} logo`}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-md object-contain"
            />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {method.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // 4. Sub-Component สำหรับแสดง "หน้ารายละเอียด QR Code"
  const renderDetails = () => {
    if (!selectedMethod) return null;

    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <button
          onClick={() => setSelectedMethod(null)}
          className="absolute top-4 left-4 flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <FaArrowLeft />
          เปลี่ยนช่องทาง
        </button>

        <div className="flex items-center gap-3">
          <Image
            src={selectedMethod.logo_url}
            alt={`${selectedMethod.name} logo`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-md object-contain"
          />
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {selectedMethod.name}
          </p>
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
            src={selectedMethod.qr_code_url}
            alt={`${selectedMethod.name} QR Code`}
            width={220}
            height={220}
          />
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
  };

  // 5. Render หลัก: เลือกว่าจะแสดงหน้าไหนตามสถานะ `selectedMethod`
  return (
    <div className="relative h-full">
      {!selectedMethod ? renderSelection() : renderDetails()}
    </div>
  );
}
