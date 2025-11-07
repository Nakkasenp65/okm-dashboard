"use client";
import React, { useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import CashPayment from "./CashPayment";
import QrPromptPayPayment from "./QrPromptPayPayment";
import CreditCardPayment from "./CreditCardPayment";

// (นำ Type SelectedItem มาไว้ที่นี่ หรือ import มาจากไฟล์ types กลาง)
type SelectedItem = {
  id: number;
  name: string;
  unitPrice: number;
  qty: number;
  category?: {
    id: number;
    color: string;
    name: string;
  };
  unit?: {
    id: number;
    name: string;
  };
  barcode?: string;
};

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: string | null;
  selectedProducts: SelectedItem[];
  onConfirm: () => void;
  onBack: () => void;
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  paymentMethod,
  selectedProducts,
  onConfirm,
  onBack,
}: PaymentConfirmationModalProps) {
  // ใช้ useMemo เพื่อคำนวณใหม่เมื่อ selectedProducts เปลี่ยนแปลงเท่านั้น
  const totalAmount = useMemo(() => {
    return selectedProducts
      .reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
      .toFixed(2);
  }, [selectedProducts]);

  // สร้าง Object Mapping เพื่อเลือก Component ที่จะแสดงผล
  const paymentViews: { [key: string]: React.ReactNode } = {
    เงินสด: (
      <CashPayment
        totalAmount={totalAmount}
        onConfirm={onConfirm}
        onBack={onBack}
      />
    ),
    "QR PromptPay": (
      <QrPromptPayPayment
        totalAmount={totalAmount}
        onConfirm={onConfirm}
        onBack={onBack}
      />
    ),
    "บัตรเครดิต/เดบิต": (
      <CreditCardPayment
        totalAmount={totalAmount}
        onConfirm={onConfirm}
        onBack={onBack}
      />
    ),
  };

  // เลือก Component ที่จะแสดงจาก paymentMethod
  const SelectedPaymentView = paymentMethod
    ? paymentViews[paymentMethod]
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-[700px] rounded-2xl p-6 shadow-2xl lg:max-w-[800px]"
    >
      <div className="flex flex-col gap-6">{SelectedPaymentView}</div>
    </Modal>
  );
}
