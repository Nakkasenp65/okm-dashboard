"use client";

import React, { useState, useEffect } from "react";
import { BANK_DATA, Bank } from "@/data/BANK_DATA";

// --- Import Child Components ---
import PaymentDetailsView from "./PaymentDetailsView";
import BankSelectionView from "./BankSelectionView";
import AddBankAccountForm from "./AddBankAccountForm";

// --- Export the interface so child components can use it ---
export interface BankAccount extends Bank {
  accountNumber: string;
  accountName: string;
}

// --- MOCK DATA ---
const MOCK_ACCOUNTS: BankAccount[] = [
  {
    ...BANK_DATA.find((b) => b.short_name_en === "KBank")!,
    accountName: "บริษัท พอสพอส จำกัด",
    accountNumber: "123-4-56789-0",
  },
  {
    ...BANK_DATA.find((b) => b.short_name_en === "SCB")!,
    accountName: "POSPOS Co., Ltd.",
    accountNumber: "987-6-54321-0",
  },
];

// --- PROPS INTERFACE ---
interface TransferPaymentComponentProps {
  totalToPay: number;
}

// --- MAIN COMPONENT: Acts as a controller for the different views ---
export default function TransferPaymentComponent({
  totalToPay,
}: TransferPaymentComponentProps) {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState<"selection" | "details" | "add_form">(
    "selection",
  );
  const [bankAccounts, setBankAccounts] =
    useState<BankAccount[]>(MOCK_ACCOUNTS);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    null,
  );

  // --- LIFECYCLE ---
  // Reset view when the total amount changes
  useEffect(() => {
    setView("selection");
    setSelectedAccount(null);
  }, [totalToPay]);

  // --- EVENT HANDLERS ---
  const handleSelectAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setView("details");
  };

  const handleSaveNewAccount = (newAccount: BankAccount) => {
    setBankAccounts((prev) => [...prev, newAccount]);
    setView("selection");
  };

  // --- RENDER LOGIC ---
  // Conditionally render the correct view based on the current state
  return (
    <div className="relative h-full">
      {view === "selection" && (
        <BankSelectionView
          accounts={bankAccounts}
          onSelectAccount={handleSelectAccount}
          onAddNew={() => setView("add_form")}
        />
      )}

      {view === "details" && selectedAccount && (
        <PaymentDetailsView
          account={selectedAccount}
          totalToPay={totalToPay}
          onBack={() => setView("selection")}
        />
      )}

      {view === "add_form" && (
        <AddBankAccountForm
          onBack={() => setView("selection")}
          onSave={handleSaveNewAccount}
        />
      )}
    </div>
  );
}
