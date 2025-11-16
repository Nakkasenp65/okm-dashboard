"use client";

import React from "react";
import Image from "next/image";
import { FaPlus } from "react-icons/fa";
import type { BankAccount } from "./TransferPaymentComponent";

// --- PROPS INTERFACE ---
interface BankSelectionViewProps {
  accounts: BankAccount[];
  onSelectAccount: (account: BankAccount) => void;
  onAddNew: () => void;
}

// --- COMPONENT DEFINITION ---
export default function BankSelectionView({
  accounts,
  onSelectAccount,
  onAddNew,
}: BankSelectionViewProps) {
  return (
    <div className="flex h-56 w-full flex-col p-4">
      <h3 className="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
        กรุณาเลือกบัญชีธนาคารที่ต้องการรับเงิน
      </h3>
      <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-1 md:grid-cols-4 lg:grid-cols-5">
        {accounts.map((account) => (
          <button
            key={account.accountNumber}
            onClick={() => onSelectAccount(account)}
            className="group flex flex-col items-center justify-center gap-2 rounded-lg border bg-white p-3 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
          >
            {account.logo_url ? (
              <Image
                src={account.logo_url}
                alt={`${account.name_th} logo`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-contain"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-500 dark:bg-gray-600 dark:text-gray-300">
                {account.short_name_en.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {account.name_th}
            </span>
          </button>
        ))}
        <button
          onClick={onAddNew}
          className="group flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-gray-50 p-3 text-center text-gray-500 transition-all hover:border-blue-500 hover:bg-white hover:text-blue-600 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-blue-400 dark:hover:bg-gray-800"
        >
          <FaPlus className="text-2xl" />
          <span className="text-xs font-medium">เพิ่มบัญชี</span>
        </button>
      </div>
    </div>
  );
}
