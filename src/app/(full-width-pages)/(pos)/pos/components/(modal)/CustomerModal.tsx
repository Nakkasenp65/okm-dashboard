"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

// Export Type/Interface เพื่อให้ Component อื่นเรียกใช้ได้
export type CustomerLevelType =
  | "ทั่วไป"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond";

export interface Customer {
  id: string;
  name: string;
  level: CustomerLevelType;
  phone: string;
  memberId: string;
  emoji: string;
  color: string;
  age?: number;
  notes?: string;
  taxId?: string;
  address?: string;
  branch?: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "สมชาย ใจดี",
    level: "Diamond",
    phone: "081-234-5678",
    memberId: "DIA001",
    emoji: "👑",
    color: "from-pink-400 to-rose-600",
    age: 45,
  },
  {
    id: "2",
    name: "สมหญิง มีสุข",
    level: "Platinum",
    phone: "082-345-6789",
    memberId: "PLA002",
    emoji: "💎",
    color: "from-cyan-400 to-blue-600",
    age: 32,
  },
  {
    id: "3",
    name: "ประเสริฐ รุ่งเรือง",
    level: "Gold",
    phone: "083-456-7890",
    memberId: "GOL003",
    emoji: "🥇",
    color: "from-yellow-400 to-amber-600",
    age: 51,
  },
  {
    id: "5",
    name: "ลูกค้าทั่วไป",
    level: "ทั่วไป",
    phone: "-",
    memberId: "N/A",
    emoji: "👤",
    color: "from-gray-400 to-gray-600",
  },
];

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

// Helper object สำหรับ map level ไปยัง emoji และ color
const levelDetails = {
  ทั่วไป: { emoji: "👤", color: "from-gray-400 to-gray-600" },
  Silver: { emoji: "🥈", color: "from-gray-300 to-slate-500" },
  Gold: { emoji: "🥇", color: "from-yellow-400 to-amber-600" },
  Platinum: { emoji: "💎", color: "from-cyan-400 to-blue-600" },
  Diamond: { emoji: "👑", color: "from-pink-400 to-rose-600" },
};

export default function CustomerModal({
  isOpen,
  onClose,
  onSelectCustomer,
}: CustomerModalProps) {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("5");

  // State สำหรับฟอร์มเพิ่มลูกค้าใหม่ (ละเอียดขึ้น)
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAge, setNewCustomerAge] = useState("");
  const [newCustomerLevel, setNewCustomerLevel] =
    useState<CustomerLevelType>("ทั่วไป");
  const [newCustomerNotes, setNewCustomerNotes] = useState("");

  const handleAddNewCustomer = () => {
    if (!newCustomerName.trim()) {
      alert("กรุณากรอกชื่อลูกค้า");
      return;
    }

    const details = levelDetails[newCustomerLevel];

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || "-",
      age: newCustomerAge ? parseInt(newCustomerAge, 10) : undefined,
      level: newCustomerLevel,
      notes: newCustomerNotes.trim(),
      memberId: `NEW${Date.now().toString().slice(-4)}`,
      emoji: details.emoji,
      color: details.color,
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setSelectedCustomerId(newCustomer.id);

    // Reset ฟอร์มทั้งหมด
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerAge("");
    setNewCustomerLevel("ทั่วไป");
    setNewCustomerNotes("");
  };

  const handleConfirmSelection = () => {
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    if (selectedCustomer) {
      onSelectCustomer(selectedCustomer);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="no-scrollbar max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        <h3 className="border-b border-gray-200 pb-4 text-2xl font-bold text-gray-800 dark:border-gray-700 dark:text-white">
          จัดการข้อมูลลูกค้า
        </h3>

        {/* === ส่วนฟอร์มเพิ่มลูกค้าใหม่ === */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
            เพิ่มลูกค้าใหม่
          </h4>

          {/* --- ส่วนข้อมูลหลัก --- */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="customer-name"
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                ชื่อ-นามสกุล<span className="text-red-500">*</span>
              </label>
              <input
                id="customer-name"
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <div>
              <label
                htmlFor="customer-phone"
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                เบอร์โทรศัพท์
              </label>
              <input
                id="customer-phone"
                type="text"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="เช่น 0812345678"
                className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
          </div>

          {/* --- ส่วนข้อมูลเพิ่มเติม --- */}
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <h5 className="mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">
              รายละเอียดเพิ่มเติม
            </h5>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="customer-level"
                  className="block text-sm font-medium text-gray-600 dark:text-gray-400"
                >
                  ระดับสมาชิก
                </label>
                <select
                  id="customer-level"
                  value={newCustomerLevel}
                  onChange={(e) =>
                    setNewCustomerLevel(e.target.value as CustomerLevelType)
                  }
                  className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="ทั่วไป">ทั่วไป</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="customer-age"
                  className="block text-sm font-medium text-gray-600 dark:text-gray-400"
                >
                  อายุ
                </label>
                <input
                  id="customer-age"
                  type="number"
                  value={newCustomerAge}
                  onChange={(e) => setNewCustomerAge(e.target.value)}
                  placeholder="เช่น 35"
                  className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="customer-notes"
                  className="block text-sm font-medium text-gray-600 dark:text-gray-400"
                >
                  หมายเหตุ
                </label>
                <textarea
                  id="customer-notes"
                  value={newCustomerNotes}
                  onChange={(e) => setNewCustomerNotes(e.target.value)}
                  rows={2}
                  placeholder="เช่น ลูกค้าประจำ, ต้องการใบกำกับภาษี..."
                  className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
                ></textarea>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddNewCustomer}
            className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-md hover:from-green-600 hover:to-emerald-700 sm:w-auto"
            variant="primary"
          >
            บันทึกและเพิ่มลูกค้า
          </Button>
        </div>

        {/* === ส่วนเลือกลูกค้าเดิม === */}
        <div className="mt-2">
          <h4 className="mb-3 text-xl font-semibold text-gray-800 dark:text-gray-200">
            เลือกลูกค้าจากรายชื่อ
          </h4>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomerId(customer.id)}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                  selectedCustomerId === customer.id
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-300 dark:border-purple-400 dark:bg-purple-950/40"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                }`}
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-3xl shadow-md ${customer.color}`}
                >
                  {customer.emoji}
                </div>
                <div className="flex-1">
                  <h6 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {customer.name}
                  </h6>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      <span className="font-mono">{customer.memberId}</span>
                    </span>
                    <span>📞 {customer.phone}</span>
                    {customer.age && <span>🎂 อายุ {customer.age} ปี</span>}
                  </div>
                </div>
                <div
                  className={`rounded-full bg-gradient-to-r px-3 py-1 text-sm font-bold text-white shadow-sm ${customer.color}`}
                >
                  {customer.level}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="py-3 text-base font-medium"
          >
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmSelection}
            disabled={!selectedCustomerId}
            className="bg-gradient-to-r from-purple-500 to-pink-600 py-3 text-base font-semibold shadow-lg transition-all hover:from-purple-600 hover:to-pink-700 disabled:opacity-50"
          >
            ยืนยันเลือกลูกค้า
          </Button>
        </div>
      </div>
    </Modal>
  );
}
