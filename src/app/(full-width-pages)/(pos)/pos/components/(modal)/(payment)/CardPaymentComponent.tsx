"use client";

import React, { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import { FaQrcode, FaLink, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { FaRegCopy } from "react-icons/fa6";

// --- Types ---
interface PaymentRecord {
  method: string;
  amount: number;
  details?: {
    paymentLink?: string;
    transactionTime?: string;
  };
}

interface CardPaymentComponentProps {
  totalToPay: number;
  onPaymentSuccess: (payments: PaymentRecord[], change: number) => void;
}

type PaymentStatus = "idle" | "generating" | "generated";

// --- Component ---
export default function CardPaymentComponent({
  totalToPay,
  onPaymentSuccess,
}: CardPaymentComponentProps) {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [paymentLink, setPaymentLink] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const handleGenerateLink = () => {
    setStatus("generating");

    // TODO: Simulate API call to generate payment link and QR code
    setTimeout(() => {
      const uniqueId = Date.now();
      const generatedLink = `https://example.com/pay?id=${uniqueId}&amount=${totalToPay}`;
      const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        generatedLink,
      )}`;

      setPaymentLink(generatedLink);
      setQrCodeUrl(generatedQrUrl);
      setStatus("generated");
    }, 2000); // Simulate a 2-second delay
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    alert("คัดลอกลิงก์แล้ว!");
  };

  const handleConfirmPayment = () => {
    // This function confirms that the payment has been manually verified (e.g., staff saw the success screen on the customer's phone)
    const paymentRecord: PaymentRecord[] = [
      {
        method: "ชำระด้วยบัตร (QR/Link)",
        amount: totalToPay,
        details: {
          paymentLink: paymentLink,
          transactionTime: new Date().toISOString(),
        },
      },
    ];
    onPaymentSuccess(paymentRecord, 0);
  };

  const renderContent = () => {
    switch (status) {
      case "generating":
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              กำลังสร้างลิงก์และ QR Code...
            </p>
          </div>
        );

      case "generated":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              กรุณาสแกน QR Code หรือใช้ลิงก์เพื่อชำระเงิน
            </h4>
            {qrCodeUrl && (
              <div className="rounded-lg bg-white p-2 shadow-md">
                <Image
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  width={200}
                  height={200}
                />
              </div>
            )}
            <div className="flex w-full items-center gap-2 rounded-lg bg-gray-200 p-2 dark:bg-gray-800">
              <FaLink className="text-gray-500" />
              <input
                type="text"
                readOnly
                value={paymentLink}
                className="w-full flex-1 border-none bg-transparent text-sm text-gray-700 select-all focus:ring-0 dark:text-gray-300"
              />
              <button
                onClick={handleCopyLink}
                className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-300 dark:text-gray-400 dark:hover:bg-gray-700"
                title="คัดลอกลิงก์"
              >
                <FaRegCopy />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              หลังจากลูกค้าชำระเงินสำเร็จแล้ว
              กรุณากดปุ่มยืนยันด้านล่างเพื่อปิดการขาย
            </p>
            <Button
              onClick={handleConfirmPayment}
              className="mt-4 w-full bg-green-500 py-3 text-lg font-bold text-white hover:bg-green-600"
            >
              <FaCheckCircle className="mr-2" />
              ตรวจสอบและยืนยันการชำระเงิน
            </Button>
          </div>
        );

      case "idle":
      default:
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <FaQrcode className="text-6xl text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300">
              คลิกเพื่อสร้างลิงก์และ QR Code
              สำหรับให้ลูกค้าชำระเงินผ่านบัตรเครดิต/เดบิต
            </p>
            <Button
              onClick={handleGenerateLink}
              className="w-full py-3 text-lg font-semibold"
            >
              สร้างลิงก์ชำระเงิน
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* --- Header --- */}
      <div className="mb-6 flex items-baseline justify-between">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          ชำระด้วยบัตร (QR/Link)
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase dark:text-gray-400">
            ยอดชำระ
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ฿{totalToPay.toFixed(2)}
          </p>
        </div>
      </div>

      {/* --- Dynamic Content Area --- */}
      <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100/50 p-8 dark:border-gray-700 dark:bg-black/20">
        {renderContent()}
      </div>
    </div>
  );
}
