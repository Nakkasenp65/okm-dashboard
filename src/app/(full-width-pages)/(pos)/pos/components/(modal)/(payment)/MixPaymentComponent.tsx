"use client";

import React, { useState, useMemo } from "react";
import { FaArrowLeft, FaTrashAlt, FaMoneyBillWave, FaUniversity, FaQrcode, FaCreditCard } from "react-icons/fa";
import { Payment, PaymentMethod } from "../PaymentModal"; // Import types from parent
import Button from "@/components/ui/button/Button";

// Interface สำหรับ Props ที่จะรับเข้ามา
interface MixedPaymentComponentProps {
  totalToPay: number;
  payments: Payment[]; // รับรายการชำระเงินที่ทำไปแล้วจาก Parent
  onPaymentsChange: (newPayments: Payment[]) => void; // ส่งรายการที่อัปเดตแล้วกลับไปให้ Parent
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
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState<"list" | "adding" | "confirming">("list");
  const [methodToAdd, setMethodToAdd] = useState<PaymentMethod | null>(null);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [pendingPayment, setPendingPayment] = useState<Payment | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- DERIVED STATE ---
  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const remaining = totalToPay - totalPaid;

  // --- EVENT HANDLERS ---
  const handleStartAdding = (method: PaymentMethod) => {
    setMethodToAdd(method);
    // ตั้งค่าเริ่มต้นให้เป็นยอดที่เหลือทั้งหมด เพื่อความสะดวก
    setAmountToAdd(remaining.toFixed(2));
    setStep("adding");
  };

  const handleCancelAdding = () => {
    setStep("list");
    setMethodToAdd(null);
    setAmountToAdd("");
  };

  const handleConfirmAdd = () => {
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0 || !methodToAdd) {
      alert("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }
    if (amount > remaining + 0.001) {
      // เพิ่มค่าเผื่อการปัดเศษ
      alert("จำนวนเงินที่กรอกมากกว่ายอดคงเหลือ");
      return;
    }

    const newPayment: Payment = {
      method: ADD_BUTTONS.find((b) => b.method === methodToAdd)?.label || "ไม่ระบุ",
      amount: amount,
    };

    // ✅ เปลี่ยน: ไม่เพิ่มเข้า payments ทันที แต่เก็บไว้ใน pending
    setPendingPayment(newPayment);
    setStep("confirming"); // ไปหน้ายืนยัน
  };

  const handleConfirmPayment = () => {
    if (!pendingPayment) return;

    // ✅ เพิ่มการชำระเข้าไปจริงๆ
    onPaymentsChange([...payments, pendingPayment]);

    // แสดง success animation
    setShowSuccess(true);

    // หลัง 1.5 วินาที กลับไป list view
    setTimeout(() => {
      setShowSuccess(false);
      setPendingPayment(null);
      setMethodToAdd(null);
      setAmountToAdd("");
      setStep("list");
    }, 1500);
  };

  const handleCancelConfirm = () => {
    // กลับไปหน้ากรอกจำนวนเงิน
    setPendingPayment(null);
    setStep("adding");
  };

  const handleRemovePayment = (indexToRemove: number) => {
    onPaymentsChange(payments.filter((_, index) => index !== indexToRemove));
  };

  // --- RENDER SUB-COMPONENTS ---

  const renderListView = () => (
    <div className="flex h-full flex-col p-4">
      {/* Summary Section */}
      <div className="mb-4 shrink-0 rounded-lg border p-4 dark:border-gray-700">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>ชำระแล้ว</span>
          <span>{totalPaid.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between text-2xl font-bold text-blue-600 dark:text-blue-400">
          <span>ยอดคงเหลือ</span>
          <span>฿{remaining.toFixed(2)}</span>
        </div>
      </div>

      {/* Added Payments List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {payments.map((p, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-md bg-white p-2 shadow-sm dark:bg-gray-700"
          >
            <span className="font-semibold">{p.method}</span>
            <div className="flex items-center gap-4">
              <span>{p.amount.toFixed(2)}</span>
              <button onClick={() => handleRemovePayment(index)} className="text-red-500 hover:text-red-700">
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
        {payments.length === 0 && <p className="pt-8 text-center text-gray-400">ยังไม่มีการชำระเงิน</p>}
      </div>

      {/* Add Payment Buttons */}
      <div className="mt-4 shrink-0">
        <p className="mb-2 text-sm font-semibold">เพิ่มการชำระเงิน</p>
        <div className="grid grid-cols-2 gap-3">
          {ADD_BUTTONS.map((btn) => (
            <Button
              key={btn.method}
              variant="outline"
              onClick={() => handleStartAdding(btn.method as PaymentMethod)}
              className="flex h-16 flex-col items-center justify-center gap-1"
            >
              <btn.icon className="text-xl" />
              <span>{btn.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAddView = () => {
    const selected = ADD_BUTTONS.find((b) => b.method === methodToAdd);
    if (!selected) return null;

    return (
      <div className="flex h-full flex-col p-6">
        <button
          onClick={handleCancelAdding}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <FaArrowLeft />
          กลับไปรายการ
        </button>

        <div className="my-8 flex flex-col items-center gap-4 text-center">
          <selected.icon className="text-5xl text-blue-500" />
          <h2 className="text-2xl font-bold">เพิ่มการชำระด้วย &quot;{selected.label}&quot;</h2>
        </div>

        <label htmlFor="amount-to-add" className="text-lg text-gray-600 dark:text-gray-300">
          จำนวนเงินที่ต้องการชำระ
        </label>
        <input
          id="amount-to-add"
          type="number"
          value={amountToAdd}
          onChange={(e) => setAmountToAdd(e.target.value)}
          placeholder={remaining.toFixed(2)}
          className="my-2 w-full appearance-none rounded-lg border-2 border-gray-300 p-4 text-center text-4xl font-bold focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
          autoFocus
        />
        <p className="text-center text-gray-500">ยอดคงเหลือ: {remaining.toFixed(2)} บาท</p>

        <div className="mt-auto">
          <Button onClick={handleConfirmAdd} className="w-full py-4 text-xl">
            ถัดไป
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirmingView = () => {
    const selected = ADD_BUTTONS.find((b) => b.method === methodToAdd);
    if (!selected || !pendingPayment) return null;

    return (
      <div className="flex h-full flex-col p-6">
        {showSuccess ? (
          // ✅ Success Animation
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75"></div>
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-green-500">
                <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-green-600">ชำระเงินสำเร็จ!</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">กำลังดำเนินการต่อ...</p>
          </div>
        ) : (
          // ✅ Confirmation UI
          <>
            <button
              onClick={handleCancelConfirm}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              <FaArrowLeft />
              กลับไปแก้ไขจำนวน
            </button>

            <div className="my-8 flex flex-col items-center gap-4 text-center">
              <selected.icon className="text-5xl text-blue-500" />
              <h2 className="text-2xl font-bold">ยืนยันการชำระเงิน</h2>
              <p className="text-gray-600 dark:text-gray-400">รอสัญญาณจากลูกค้า</p>
            </div>

            {/* Payment Details Card */}
            <div className="mb-6 rounded-xl border-2 border-blue-500 bg-blue-50 p-6 dark:bg-blue-900/20">
              <div className="flex items-center justify-between border-b border-blue-200 pb-4 dark:border-blue-700">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">ช่องทาง</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{pendingPayment.method}</span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">จำนวนเงิน</span>
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  ฿{pendingPayment.amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ กรุณาตรวจสอบให้แน่ใจว่าได้รับเงินจากลูกค้าแล้ว ก่อนกดปุ่มยืนยัน
              </p>
            </div>

            <div className="mt-auto space-y-3">
              <Button
                onClick={handleConfirmPayment}
                className="w-full bg-green-600 py-4 text-xl font-bold hover:bg-green-700"
              >
                ✓ ยืนยัน - ได้รับเงินแล้ว
              </Button>
              <Button onClick={handleCancelConfirm} variant="outline" className="w-full py-3 text-lg">
                แก้ไขจำนวนเงิน
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return step === "list" ? renderListView() : step === "adding" ? renderAddView() : renderConfirmingView();
}
