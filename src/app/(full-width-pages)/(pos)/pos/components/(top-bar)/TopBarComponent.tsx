"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";
import { StaffMember } from "../../types/Pos";
import Button from "@/components/ui/button/Button";
import SellerProfile from "./SellerProfile";
// ปรับ Import path ให้ตรงกับโครงสร้างโปรเจคของคุณ

// Export Type นี้ออกไปเพื่อให้ page.tsx เรียกใช้ได้
export type PosOperationMode = "sell" | "consignment" | "repair";

interface TopBarComponentProps {
  activePosOperationMode: PosOperationMode;
  setActivePosOperationMode: (mode: PosOperationMode) => void;
  currentIssuer: StaffMember;
  setCurrentIssuer: (staff: StaffMember) => void;
  allStaff: StaffMember[];
}

const operationModes = [
  { id: "sell", label: "ขายซื้อ" },
  { id: "consignment", label: "ขายฝาก" },
  { id: "repair", label: "ซ่อม" },
];

export default function TopBarComponent({
  activePosOperationMode,
  setActivePosOperationMode,
  currentIssuer,
  setCurrentIssuer,
  allStaff,
}: TopBarComponentProps) {
  const router = useRouter();

  return (
    <div className="flex w-full shrink-0 items-center gap-2 bg-gray-900 p-2 pt-4">
      <Button onClick={() => router.replace("/")} className="shrink-0">
        <FaArrowLeftLong />
        <span className="ml-2 hidden sm:inline">กลับสู่หน้า CP</span>
      </Button>

      <div className="flex h-full flex-1 items-center justify-end gap-1 sm:gap-2">
        {/* Section: Operation Mode Toggle */}
        <div className="flex h-full items-center gap-0.5 rounded-xl bg-gray-800 p-0.5 sm:gap-1 sm:p-1">
          {operationModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActivePosOperationMode(mode.id as PosOperationMode)}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors duration-200 sm:px-4 sm:py-1.5 sm:text-sm ${
                activePosOperationMode === mode.id
                  ? "bg-blue-500 text-white shadow"
                  : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <span className="hidden sm:inline">{mode.label}</span>
              <span className="sm:hidden">
                {mode.id === "sell"
                  ? "ขาย"
                  : mode.id === "consignment"
                  ? "ฝาก"
                  : "ซ่อม"}
              </span>
            </button>
          ))}
        </div>
        
        {/* Section: Seller Profile */}
        <SellerProfile
          currentSeller={currentIssuer}
          allStaff={allStaff}
          onSellerChange={setCurrentIssuer}
        />
      </div>
    </div>
  );
}