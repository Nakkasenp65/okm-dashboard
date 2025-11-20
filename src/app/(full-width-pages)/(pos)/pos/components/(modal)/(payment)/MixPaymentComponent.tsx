"use client";

import React, { useState, useMemo } from "react";
import {
  FaArrowLeft,
  FaTrashAlt,
  FaMoneyBillWave,
  FaUniversity,
  FaQrcode,
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaPlay,
} from "react-icons/fa";
import { Payment, PaymentMethod } from "../PaymentModal"; // Import types from parent
import Button from "@/components/ui/button/Button";

// Interface สำหรับ Props ที่จะรับเข้ามา
interface MixedPaymentComponentProps {
  totalToPay: number;
  payments: Payment[]; // รับรายการชำระเงินที่ทำไปแล้วจาก Parent
  onPaymentsChange: (newPayments: Payment[]) => void; // ส่งรายการที่อัปเดตแล้วกลับไปให้ Parent
}

interface PlannedPayment {
  id: string;
  method: string;
  methodKey: PaymentMethod;
  amount: number;
  status: "pending" | "paid";
}

// ข้อมูลสำหรับสร้างปุ่มเพิ่มการชำระเงิน
const ADD_BUTTONS: {
  method: PaymentMethod;
  label: string;
  icon: React.ElementType;
}[] = [
  { method: "cash", label: "เงินสด", icon: FaMoneyBillWave },
  { method: "transfer", label: "ธนาคาร", icon: FaUniversity },
  { method: "online", label: "ออนไลน์", icon: FaQrcode },
  { method: "card", label: "บัตร", icon: FaCreditCard },
];

export default function MixedPaymentComponent({ totalToPay, payments, onPaymentsChange }: MixedPaymentComponentProps) {
  // --- STATE ---
  const [plannedPayments, setPlannedPayments] = useState<PlannedPayment[]>([]);

  // Mode: 'planning' | 'adding' | 'processing'
  const [mode, setMode] = useState<"planning" | "adding" | "processing">("planning");

  // Adding State
  const [methodToAdd, setMethodToAdd] = useState<PaymentMethod | null>(null);
  const [amountToAdd, setAmountToAdd] = useState("");

  // Processing State
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Confirmation Modal State
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);

  // --- DERIVED VALUES ---
  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const totalPendingPlan = useMemo(
    () => plannedPayments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
    [plannedPayments],
  );

  // ยอดที่เหลือที่ต้องจัดการ (Total - Paid - PendingPlans)
  // หมายเหตุ: totalPaid จะเพิ่มขึ้นเมื่อเรา confirm payment ใน processing step
  // ดังนั้น remainingToAllocate จะลดลงเรื่อยๆ จนเป็น 0 เมื่อวางแผนครบ
  // แต่เมื่อเริ่มจ่าย (processing) เราไม่สนใจ remainingToAllocate แล้ว
  const remainingToAllocate = totalToPay - totalPaid - totalPendingPlan;
  const isAllocationComplete = Math.abs(remainingToAllocate) < 0.01;

  // --- HANDLERS ---

  const handleStartAdding = (method: PaymentMethod) => {
    setMethodToAdd(method);
    setAmountToAdd(remainingToAllocate > 0 ? remainingToAllocate.toFixed(2) : "");
    setMode("adding");
  };

  const handleConfirmAdd = () => {
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      alert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }
    if (amount > remainingToAllocate + 0.01) {
      alert("ยอดเงินเกินจำนวนที่ต้องชำระ");
      return;
    }

    const btn = ADD_BUTTONS.find((b) => b.method === methodToAdd);
    const newPlan: PlannedPayment = {
      id: Date.now().toString(),
      method: btn?.label || "Other",
      methodKey: methodToAdd!,
      amount: amount,
      status: "pending",
    };

    setPlannedPayments([...plannedPayments, newPlan]);
    setMode("planning");
    setMethodToAdd(null);
    setAmountToAdd("");
  };

  const handleRemovePlan = (id: string) => {
    setPlannedPayments(plannedPayments.filter((p) => p.id !== id));
  };

  const handleStartProcess = () => {
    if (!isAllocationComplete) return;
    setShowStartConfirmation(true);
  };

  const handleConfirmStartProcess = () => {
    setShowStartConfirmation(false);
    setMode("processing");
    setCurrentProcessingIndex(0);
  };

  const handleConfirmPaymentStep = () => {
    const currentPlan = plannedPayments[currentProcessingIndex];
    if (!currentPlan) return;

    // 1. Add to actual payments
    const newPayment: Payment = {
      method: currentPlan.method,
      amount: currentPlan.amount,
    };
    onPaymentsChange([...payments, newPayment]);

    // 2. Update local status
    const updatedPlans = [...plannedPayments];
    updatedPlans[currentProcessingIndex].status = "paid";
    setPlannedPayments(updatedPlans);

    // 3. Show success and move next
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentProcessingIndex((prev) => prev + 1);
    }, 1500);
  };

  // --- RENDERERS ---

  const renderPlanningView = () => (
    <div className="flex h-full flex-col p-4">
      {/* Header Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
        <div>
          <p className="text-sm text-gray-500">ยอดทั้งหมด</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{totalToPay.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">เหลือที่ต้องจัดสรร</p>
          <p className={`text-xl font-bold ${remainingToAllocate > 0.01 ? "text-red-500" : "text-green-500"}`}>
            {remainingToAllocate.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Planned List */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">รายการที่เลือกไว้</h3>
        <div className="space-y-2">
          {plannedPayments.map((plan, index) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{plan.method}</p>
                  <p className="text-xs text-gray-500">รอดำเนินการ</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{plan.amount.toFixed(2)}</span>
                <button onClick={() => handleRemovePlan(plan.id)} className="text-red-500 hover:text-red-700">
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
          {plannedPayments.length === 0 && (
            <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 dark:border-gray-700">
              ยังไม่มีรายการ
            </div>
          )}
        </div>
      </div>

      {/* Add Buttons */}
      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">เพิ่มวิธีการชำระเงิน</p>
        <div className="grid grid-cols-4 gap-2">
          {ADD_BUTTONS.map((btn) => (
            <button
              key={btn.method}
              onClick={() => handleStartAdding(btn.method)}
              disabled={remainingToAllocate <= 0.01}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <btn.icon className="text-xl text-blue-500" />
              <span className="text-xs">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="mt-4">
        <Button
          onClick={handleStartProcess}
          disabled={!isAllocationComplete || plannedPayments.length === 0}
          className={`w-full py-3 text-lg font-bold ${
            isAllocationComplete ? "bg-green-600 hover:bg-green-700" : "cursor-not-allowed bg-gray-300"
          }`}
        >
          {isAllocationComplete ? (
            <span className="flex items-center justify-center gap-2">
              <FaPlay /> เริ่มต้นการชำระเงิน
            </span>
          ) : (
            `ขาดอีก ${remainingToAllocate.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* Confirmation Modal for Starting Payment */}
      {showStartConfirmation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold">ยืนยันการชำระเงินแบบผสม?</h3>
            </div>

            <div className="mb-6 space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                หากลูกค้าต้องการ <strong>ใบกำกับภาษี</strong> หรือ <strong>หัก ณ ที่จ่าย</strong>
                กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน
              </p>
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                * เมื่อกดยืนยันแล้ว ระบบจะเริ่มขั้นตอนการรับเงินทันทีและไม่สามารถย้อนกลับมาแก้ไขรายการได้
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowStartConfirmation(false)} className="flex-1">
                ยกเลิก
              </Button>
              <Button onClick={handleConfirmStartProcess} className="flex-1 bg-green-600 hover:bg-green-700">
                ยืนยันเริ่มชำระเงิน
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddingView = () => {
    const selected = ADD_BUTTONS.find((b) => b.method === methodToAdd);
    return (
      <div className="flex h-full flex-col p-6">
        <button onClick={() => setMode("planning")} className="mb-4 flex items-center gap-2 text-gray-500">
          <FaArrowLeft /> กลับ
        </button>
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900">
            {selected && <selected.icon className="text-4xl" />}
          </div>
          <h3 className="text-2xl font-bold">ระบุจำนวนเงิน ({selected?.label})</h3>
          <input
            type="number"
            value={amountToAdd}
            onChange={(e) => setAmountToAdd(e.target.value)}
            className="w-full rounded-xl border-2 border-blue-500 bg-transparent p-4 text-center text-4xl font-bold outline-none"
            autoFocus
            placeholder="0.00"
          />
          <p className="text-gray-500">ยอดที่เหลือ: {remainingToAllocate.toFixed(2)}</p>
        </div>
        <Button onClick={handleConfirmAdd} className="w-full py-4 text-xl">
          ยืนยัน
        </Button>
      </div>
    );
  };

  const renderProcessingView = () => {
    const currentPlan = plannedPayments[currentProcessingIndex];
    const isFinished = currentProcessingIndex >= plannedPayments.length;

    if (isFinished) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <div className="animate-in zoom-in mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 duration-300">
            <FaCheckCircle className="text-6xl" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-green-600">ชำระเงินครบถ้วนแล้ว</h2>
          <p className="mb-8 text-gray-500 dark:text-gray-400">รายการชำระเงินทั้งหมดเสร็จสมบูรณ์</p>
        </div>
      );
    }

    if (showSuccess) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6">
          <div className="animate-bounce rounded-full bg-green-500 p-6 text-white shadow-lg">
            <FaCheckCircle className="text-6xl" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-green-600">บันทึกยอดแล้ว!</h2>
        </div>
      );
    }

    const selectedBtn = ADD_BUTTONS.find((b) => b.method === currentPlan.methodKey);

    return (
      <div className="flex h-full flex-col p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold">ขั้นตอนการชำระเงิน</h3>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            {currentProcessingIndex + 1} / {plannedPayments.length}
          </span>
        </div>

        {/* Current Step Card */}
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-blue-500 bg-blue-50 p-8 dark:bg-blue-900/20">
          <div className="mb-4 text-blue-600 dark:text-blue-400">
            {selectedBtn && <selectedBtn.icon className="text-6xl" />}
          </div>
          <h2 className="mb-2 text-3xl font-bold">{currentPlan.method}</h2>
          <p className="mb-6 text-gray-500">ยอดที่ต้องชำระ</p>
          <div className="text-5xl font-bold text-blue-700 dark:text-blue-300">฿{currentPlan.amount.toFixed(2)}</div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-lg bg-yellow-50 p-3 text-center text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
            <FaClock className="mr-2 inline" />
            รอรับเงินจากลูกค้า...
          </div>
          <Button onClick={handleConfirmPaymentStep} className="w-full bg-green-600 py-4 text-xl hover:bg-green-700">
            ยืนยันการรับเงิน
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900">
      {mode === "planning" && renderPlanningView()}
      {mode === "adding" && renderAddingView()}
      {mode === "processing" && renderProcessingView()}
    </div>
  );
}
