"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import { UserIcon } from "@/icons";

type CustomerLevelType = "ทั่วไป" | "Silver" | "Gold" | "Platinum" | "Diamond";

interface MockCustomer {
  id: string;
  name: string;
  level: CustomerLevelType;
  phone: string;
  memberId: string;
  emoji: string;
  color: string;
}

const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: "1",
    name: "สมชาย ใจดี",
    level: "Diamond",
    phone: "081-234-5678",
    memberId: "DIA001",
    emoji: "�",
    color: "from-pink-400 to-rose-600",
  },
  {
    id: "2",
    name: "สมหญิง มีสุข",
    level: "Platinum",
    phone: "082-345-6789",
    memberId: "PLA002",
    emoji: "💎",
    color: "from-cyan-400 to-blue-600",
  },
  {
    id: "3",
    name: "ประเสริฐ รุ่งเรือง",
    level: "Gold",
    phone: "083-456-7890",
    memberId: "GOL003",
    emoji: "🥇",
    color: "from-yellow-400 to-amber-600",
  },
  {
    id: "4",
    name: "สมศรี พรทิพย์",
    level: "Silver",
    phone: "084-567-8901",
    memberId: "SIL004",
    emoji: "🥈",
    color: "from-gray-300 to-slate-500",
  },
  {
    id: "5",
    name: "นายทั่วไป คนธรรมดา",
    level: "ทั่วไป",
    phone: "085-678-9012",
    memberId: "REG005",
    emoji: "�",
    color: "from-gray-400 to-gray-600",
  },
];

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (level: CustomerLevelType) => void;
}

export default function CustomerModal({
  isOpen,
  onClose,
  onSelectLevel,
}: CustomerModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("5"); // Default: ทั่วไป

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomer(customerId);
    const customer = MOCK_CUSTOMERS.find((c) => c.id === customerId);
    if (customer) {
      onSelectLevel(customer.level);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="w-full max-w-[800px] rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          {/* Customer Identification Instructions */}
          <div id="customer-identification" className="mt-4">
            {/* Instructions */}
            <div className="mb-4 rounded-lg bg-purple-50 p-4 dark:bg-purple-950/30">
              <h6 className="mb-4 text-2xl font-semibold text-purple-900 dark:text-purple-100">
                คำแนะนำการระบุสมาชิก
              </h6>
              <ul className="grid grid-cols-2 gap-4 space-y-1 text-lg text-purple-800 dark:text-purple-200">
                <li className="flex flex-col items-center justify-center rounded-2xl border-4 border-purple-800 p-4">
                  <Image
                    width={200}
                    height={200}
                    src="/images/assets/scan.png"
                    className="w-24"
                    alt="Scan"
                  />
                  <span className="text-2xl">แสกน QR สมาชิก</span>
                </li>
                <li className="flex flex-col items-center justify-center rounded-2xl border-4 border-purple-800 p-4">
                  <Image
                    width={200}
                    height={200}
                    src="/images/assets/type.png"
                    className="w-24"
                    alt="Input"
                  />
                  <span className="text-2xl">กรอกรหัสสมาชิกด้านล่าง</span>
                </li>
              </ul>
            </div>

            {/* Mock Customer List */}
            <div className="mb-4">
              <div className="max-h-60 space-y-3 overflow-y-auto">
                {MOCK_CUSTOMERS.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer.id)}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedCustomer === customer.id
                        ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-center gap-4">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-2xl shadow-md ${customer.color}`}
                        >
                          {customer.emoji}
                        </div>
                        <div className="flex-1">
                          <h6 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {customer.name}
                          </h6>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              <UserIcon />
                              รหัส: {customer.memberId}
                            </span>
                            <span>📞 {customer.phone}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="rounded-full bg-gradient-to-r px-3 py-1 text-sm font-semibold text-white shadow-sm">
                              <span
                                className={`inline-block rounded-full bg-gradient-to-r px-3 py-1 ${customer.color}`}
                              >
                                {customer.level}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {selectedCustomer === customer.id && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Member ID Input Field */}
          <div className="mt-4 flex flex-col gap-2 text-xl">
            <label className="text-lg font-medium" htmlFor="member-id">
              กรอกรหัสสมาชิก (หรือเลือกจากด้านบน)
            </label>
            <input
              id="member-id"
              name="member-id"
              type="text"
              placeholder="เช่น: DIA001, PLA002, GOL003, SIL004, REG005"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-purple-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full py-3 text-base font-medium"
          >
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSelectCustomer(selectedCustomer);
              onClose();
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-3 text-base font-semibold shadow-lg transition-all hover:from-purple-600 hover:to-pink-700"
          >
            เลือกลูกค้านี้
          </Button>
        </div>
      </div>
    </Modal>
  );
}
