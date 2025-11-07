"use client";
import React from "react";
import Button from "@/components/ui/button/Button";

interface PaymentActionsProps {
  onBack: () => void;
  onConfirm: () => void;
  confirmButtonClass: string;
}

export default function PaymentActions({
  onBack,
  onConfirm,
  confirmButtonClass,
}: PaymentActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        variant="outline"
        className="flex-1 py-3 text-base font-semibold"
        onClick={onBack}
      >
        ย้อนกลับ
      </Button>
      <Button
        className={`flex-1 py-3 text-base font-semibold ${confirmButtonClass}`}
        onClick={onConfirm}
      >
        ยืนยันชำระเงิน
      </Button>
    </div>
  );
}
