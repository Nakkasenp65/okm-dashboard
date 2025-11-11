"use client";

import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Button from "@/components/ui/button/Button";
import { BANK_DATA } from "@/data/BANK_DATA";
import type { BankAccount } from "./TransferPaymentComponent";

// --- PROPS INTERFACE ---
interface AddBankAccountFormProps {
  onBack: () => void;
  onSave: (newAccount: BankAccount) => void;
}

// --- COMPONENT DEFINITION ---
export default function AddBankAccountForm({
  onBack,
  onSave,
}: AddBankAccountFormProps) {
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const handleSave = () => {
    if (!selectedBankId || !accountName.trim() || !accountNumber.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    const selectedBankData = BANK_DATA.find(
      (b) => b.short_name_en === selectedBankId,
    );
    if (!selectedBankData) {
      alert("ไม่พบข้อมูลธนาคาร");
      return;
    }
    const newAccount: BankAccount = {
      ...selectedBankData,
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
    };
    onSave(newAccount);
  };

  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack} className="p-2">
          <FaArrowLeft />
        </Button>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          เพิ่มบัญชีธนาคารใหม่
        </h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            ธนาคาร<span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="" disabled>
              -- กรุณาเลือกธนาคาร --
            </option>
            {BANK_DATA.map((bank) => (
              <option key={bank.short_name_en} value={bank.short_name_en}>
                {bank.name_th}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            ชื่อบัญชี<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="เช่น บริษัท พอสพอส จำกัด"
            className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            เลขที่บัญชี<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="เช่น 123-4-56789-0"
            className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>
      <div className="mt-auto pt-6">
        <Button onClick={handleSave} className="w-full py-3 text-base">
          บันทึกบัญชี
        </Button>
      </div>
    </div>
  );
}
