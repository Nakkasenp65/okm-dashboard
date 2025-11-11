"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { FaBarcode } from "react-icons/fa";

// Export Interface เพื่อให้ Component อื่นนำไปใช้ได้
export interface Discount {
  id: string; // ใช้ string เพื่อรองรับ cả custom และ promo
  name: string;
  type: "percentage" | "fixed";
  value: number;
  code?: string; // เพิ่ม property สำหรับโค้ดส่วนลด
}

// Mock discount data (เพิ่ม 'code' สำหรับการสแกน)
const MOCK_PROMOTIONS: Discount[] = [
  {
    id: "promo-1",
    name: "ส่วนลดเทศกาลปีใหม่",
    type: "percentage",
    value: 20,
    code: "NEWYEAR20",
  },
  {
    id: "promo-2",
    name: "ส่วนลดสมาชิก VIP",
    type: "percentage",
    value: 15,
    code: "VIPONLY15",
  },
  {
    id: "promo-3",
    name: "ส่วนลดวันเกิด",
    type: "fixed",
    value: 50,
    code: "HBD50",
  },
  {
    id: "promo-4",
    name: "ซื้อครบ 500 บาท",
    type: "percentage",
    value: 10,
    code: "OVER500",
  },
  {
    id: "promo-5",
    name: "สินค้าโปรโมชั่น",
    type: "fixed",
    value: 30,
    code: "PROMO30",
  },
];

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDiscounts: Discount[];
  onApplyDiscounts: (discounts: Discount[]) => void;
}

export default function DiscountModal({
  isOpen,
  onClose,
  initialDiscounts,
  onApplyDiscounts,
}: DiscountModalProps) {
  const [activeTab, setActiveTab] = useState<"promos" | "custom" | "scan">(
    "promos",
  );
  const [selectedPromoIds, setSelectedPromoIds] = useState<Set<string>>(
    new Set(),
  );

  // State สำหรับ "กำหนดเอง"
  const [customAmount, setCustomAmount] = useState("");
  const [customType, setCustomType] = useState<"fixed" | "percentage">("fixed");

  // State สำหรับ "สแกนโค้ด"
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanInput, setScanInput] = useState("");
  const [scanStatus, setScanStatus] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });

  // Sync state กับ initialDiscounts เมื่อเปิด Modal
  useEffect(() => {
    if (isOpen) {
      const promoIds = new Set(
        initialDiscounts
          .filter((d) => d.id.startsWith("promo-"))
          .map((d) => d.id),
      );
      setSelectedPromoIds(promoIds);
    } else {
      // Reset state ทั้งหมดเมื่อปิด Modal
      setCustomAmount("");
      setScanInput("");
      setScanStatus({ type: "idle", message: "" });
      setActiveTab("promos");
    }
  }, [isOpen, initialDiscounts]);

  // Auto-focus input field เมื่อเปลี่ยนมาที่แท็บสแกน
  useEffect(() => {
    if (activeTab === "scan" && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [activeTab]);

  const handleTogglePromo = (promoId: string) => {
    setSelectedPromoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(promoId)) {
        newSet.delete(promoId);
      } else {
        newSet.add(promoId);
      }
      return newSet;
    });
  };

  // Logic การจัดการเมื่อมีการสแกน/กรอกโค้ด
  const handleScanCode = () => {
    if (!scanInput.trim()) return;

    const codeToFind = scanInput.trim().toUpperCase();
    const foundPromo = MOCK_PROMOTIONS.find(
      (p) => p.code?.toUpperCase() === codeToFind,
    );

    if (foundPromo) {
      // ถ้าเจอโปรโมชั่น ให้เพิ่มเข้าไปในรายการที่เลือก (ถ้ายังไม่มี)
      if (!selectedPromoIds.has(foundPromo.id)) {
        handleTogglePromo(foundPromo.id);
      }
      setScanStatus({
        type: "success",
        message: `เพิ่มส่วนลด "${foundPromo.name}" สำเร็จ!`,
      });
      setScanInput(""); // เคลียร์ input หลังสแกนสำเร็จ
    } else {
      setScanStatus({ type: "error", message: "ไม่พบโค้ดส่วนลดนี้" });
    }
  };

  // Logic การยืนยันเพื่อใช้ส่วนลดทั้งหมด
  const handleApply = () => {
    const finalDiscounts: Discount[] = [];

    // 1. เพิ่มโปรโมชั่นที่เลือกจากแท็บ "เลือกโปรโมชั่น" และ "สแกนโค้ด"
    const selectedPromos = MOCK_PROMOTIONS.filter((p) =>
      selectedPromoIds.has(p.id),
    );
    finalDiscounts.push(...selectedPromos);

    // 2. เพิ่มส่วนลดที่กำหนดเอง (ถ้ามี)
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0) {
      finalDiscounts.push({
        id: "custom-" + Date.now(),
        name: `ส่วนลดกำหนดเอง`,
        type: customType,
        value: amount,
      });
    }

    onApplyDiscounts(finalDiscounts);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl p-0 shadow-2xl"
    >
      {/* Header and Tabs */}
      <div className="shrink-0 border-b border-gray-200 p-6 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
          จัดการส่วนลด
        </h3>
        <div className="mt-4 flex gap-2 border-b-2 border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("promos")}
            className={`px-4 py-2 text-base font-semibold transition-colors ${activeTab === "promos" ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"}`}
          >
            เลือกโปรโมชั่น
          </button>
          <button
            onClick={() => setActiveTab("scan")}
            className={`px-4 py-2 text-base font-semibold transition-colors ${activeTab === "scan" ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"}`}
          >
            สแกนโค้ด
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-4 py-2 text-base font-semibold transition-colors ${activeTab === "custom" ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"}`}
          >
            กำหนดเอง
          </button>
        </div>
      </div>

      {/* Content (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Promotions Tab */}
        {activeTab === "promos" && (
          <div className="space-y-3">
            {MOCK_PROMOTIONS.map((promo) => (
              <div
                key={promo.id}
                onClick={() => handleTogglePromo(promo.id)}
                className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ${selectedPromoIds.has(promo.id) ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 dark:border-blue-400 dark:bg-blue-950/40" : "bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"}`}
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    {promo.name}
                  </h4>
                  <p
                    className={`font-bold ${promo.type === "percentage" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}
                  >
                    {promo.type === "percentage"
                      ? `ลด ${promo.value}%`
                      : `ลด ${promo.value} บาท`}
                  </p>
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selectedPromoIds.has(promo.id) ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
                >
                  {selectedPromoIds.has(promo.id) && (
                    <span className="text-white">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scan Code Tab */}
        {activeTab === "scan" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <FaBarcode className="text-6xl text-gray-400" />
            <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              สแกนหรือกรอกโค้ดส่วนลด
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              วางเคอร์เซอร์ในช่องด้านล่างแล้วใช้เครื่องสแกน หรือพิมพ์โค้ดแล้วกด
              Enter
            </p>
            <input
              ref={scanInputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleScanCode();
              }}
              placeholder="โค้ดส่วนลด..."
              className="w-full max-w-sm rounded-lg border-gray-300 p-4 text-center font-mono text-2xl uppercase shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-900"
            />
            <Button
              onClick={handleScanCode}
              className="w-full max-w-sm py-3 text-lg"
            >
              ยืนยันโค้ด
            </Button>
            {scanStatus.type !== "idle" && (
              <div
                className={`mt-2 w-full max-w-sm rounded-md p-3 text-center font-semibold ${
                  scanStatus.type === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                }`}
              >
                {scanStatus.message}
              </div>
            )}
          </div>
        )}

        {/* Custom Discount Tab */}
        {activeTab === "custom" && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              กรอกจำนวนส่วนลดที่ต้องการใช้กับยอดรวมของสินค้านี้
            </p>
            <div className="flex gap-2 rounded-lg border bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800">
              <button
                onClick={() => setCustomType("fixed")}
                className={`flex-1 rounded-md px-4 py-2 font-semibold transition-colors ${customType === "fixed" ? "bg-blue-500 text-white shadow" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
              >
                บาท (฿)
              </button>
              <button
                onClick={() => setCustomType("percentage")}
                className={`flex-1 rounded-md px-4 py-2 font-semibold transition-colors ${customType === "percentage" ? "bg-blue-500 text-white shadow" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
              >
                เปอร์เซ็นต์ (%)
              </button>
            </div>
            <div>
              <label
                htmlFor="custom-amount"
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                จำนวนส่วนลด
              </label>
              <input
                id="custom-amount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={customType === "fixed" ? "เช่น 100" : "เช่น 10"}
                className="mt-1 w-full rounded-lg border-gray-300 p-3 text-2xl font-bold shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid shrink-0 grid-cols-2 gap-4 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
        <Button
          variant="outline"
          onClick={onClose}
          className="py-3 text-base font-medium"
        >
          ยกเลิก
        </Button>
        <Button
          variant="primary"
          onClick={handleApply}
          className="bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-base font-semibold shadow-lg transition-all hover:from-blue-600 hover:to-purple-700"
        >
          ใช้ส่วนลด
        </Button>
      </div>
    </Modal>
  );
}
