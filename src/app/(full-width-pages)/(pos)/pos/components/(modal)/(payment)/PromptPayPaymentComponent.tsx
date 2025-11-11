"use client";
import React from "react";
import { FaBolt, FaSatelliteDish, FaSms } from "react-icons/fa";

// --- Props Interface ---
interface PromptPayPaymentComponentProps {
  totalToPay: number;
}

// --- Component Definition ---
export default function PromptPayPaymentComponent({
  totalToPay,
}: PromptPayPaymentComponentProps) {
  const handleGatewaySelection = (gatewayName: string) => {
    // This is where you would handle the logic for each gateway in the future.
    // For now, it just logs the selection.
    console.log(`Selected Gateway: ${gatewayName}`);
    alert(
      `เลือก ${gatewayName} (ยอดชำระ: ${totalToPay.toFixed(
        2,
      )} บาท) - ส่วนนี้จะเชื่อมต่อ API ต่อไป`,
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6">
      <h3 className="mb-2 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
        เลือกช่องทางการชำระเงินพร้อมเพย์
      </h3>
      <p className="mb-8 text-center text-gray-500 dark:text-gray-400">
        ยอดชำระ:{" "}
        <span className="font-bold text-blue-600 dark:text-blue-400">
          ฿{totalToPay.toFixed(2)}
        </span>
      </p>

      <div className="grid w-full max-w-lg grid-cols-1 gap-4">
        {/* Rabbit Gateway Button */}
        <button
          onClick={() => handleGatewaySelection("Rabbit Gateway")}
          className="group flex h-24 items-center justify-center gap-4 rounded-lg border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-orange-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-400"
        >
          <FaBolt className="text-4xl text-orange-500 transition-transform group-hover:scale-110" />
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Rabbit Gateway
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ชำระเงินผ่าน QR Code ของ Rabbit
            </p>
          </div>
        </button>

        {/* Beam Gateway Button */}
        <button
          onClick={() => handleGatewaySelection("Beam Gateway")}
          className="group flex h-24 items-center justify-center gap-4 rounded-lg border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-purple-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-400"
        >
          <FaSatelliteDish className="text-4xl text-purple-500 transition-transform group-hover:scale-110" />
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Beam Gateway
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ชำระเงินผ่าน QR Code ของ Beam
            </p>
          </div>
        </button>

        {/* OK Mobile SMS Gateway Button */}
        <button
          onClick={() => handleGatewaySelection("OK Mobile SMS Gateway")}
          className="group flex h-24 items-center justify-center gap-4 rounded-lg border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-green-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-400"
        >
          <FaSms className="text-4xl text-green-500 transition-transform group-hover:scale-110" />
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              OK Mobile SMS Gateway
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ชำระเงินผ่าน QR Code Gateway ของร้าน
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
