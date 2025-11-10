"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BANK_DATA } from "@/data/BANK_DATA";
import { CARD_NETWORK_DATA, DECORATIVE_LOGOS } from "@/data/CARD_NETWORK_DATA";

interface CardPaymentComponentProps {
  totalToPay: number;
}

export default function CardPaymentComponent({
  totalToPay,
}: CardPaymentComponentProps) {
  const [cardChargeType, setCardChargeType] = useState<"credit" | "debit">(
    "credit",
  );
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [last4Digits, setLast4Digits] = useState("");
  const [approvalCode, setApprovalCode] = useState("");

  return (
    <div className="flex h-full flex-col p-6">
      {/* --- Header --- */}
      <div className="mb-6 flex items-baseline justify-between">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          ชำระด้วยบัตร
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

      {/* --- Form Section --- */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* Card Charge Type Radio */}
        <div className="flex items-center gap-6 rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
          <label
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md p-2 transition-colors"
            style={{
              backgroundColor:
                cardChargeType === "credit" ? "white" : "transparent",
              color: cardChargeType === "credit" ? "#3b82f6" : "",
            }}
          >
            <input
              type="radio"
              name="cardType"
              value="credit"
              checked={cardChargeType === "credit"}
              onChange={() => setCardChargeType("credit")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold">เครดิต</span>
          </label>
          <label
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md p-2 transition-colors"
            style={{
              backgroundColor:
                cardChargeType === "debit" ? "white" : "transparent",
              color: cardChargeType === "debit" ? "#3b82f6" : "",
            }}
          >
            <input
              type="radio"
              name="cardType"
              value="debit"
              checked={cardChargeType === "debit"}
              onChange={() => setCardChargeType("debit")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold">เดบิต</span>
          </label>
        </div>

        {/* Select Card Network */}
        <div>
          <label
            htmlFor="card-network"
            className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            ประเภทบัตร
          </label>
          <select
            id="card-network"
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="" disabled>
              กรุณาเลือกประเภทบัตร
            </option>
            {CARD_NETWORK_DATA.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select Bank */}
        <div>
          <label
            htmlFor="card-bank"
            className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            ธนาคาร
          </label>
          <select
            id="card-bank"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="" disabled>
              กรุณาเลือกธนาคาร
            </option>
            {BANK_DATA.map((bank) => (
              <option key={bank.short_name_en} value={bank.short_name_en}>
                {bank.name_th}
              </option>
            ))}
          </select>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="last-4-digits"
              className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              เลข 4 ตัวท้าย (ถ้ามี)
            </label>
            <input
              type="text"
              id="last-4-digits"
              value={last4Digits}
              onChange={(e) =>
                setLast4Digits(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              maxLength={4}
              placeholder="1234"
              className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <label
              htmlFor="approval-code"
              className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              รหัสอนุมัติ (ถ้ามี)
            </label>
            <input
              type="text"
              id="approval-code"
              value={approvalCode}
              onChange={(e) => setApprovalCode(e.target.value)}
              placeholder="AB1234"
              className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* --- Footer with Logos --- */}
      <div className="mt-6 shrink-0 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center justify-center gap-4 opacity-50">
          {DECORATIVE_LOGOS.map((logo) => (
            <div key={logo.id} className="relative h-8 w-12">
              <Image
                src={logo.url}
                alt={logo.id}
                layout="fill"
                objectFit="contain"
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          ระบบนี้เป็นเพียงการบันทึกข้อมูล ไม่มีการเชื่อมต่อกับระบบชำระเงินจริง
        </p>
      </div>
    </div>
  );
}
