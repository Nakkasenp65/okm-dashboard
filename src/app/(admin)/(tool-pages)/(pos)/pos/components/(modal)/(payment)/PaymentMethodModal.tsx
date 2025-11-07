"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { FaMoneyBillWave, FaQrcode, FaCreditCard } from "@/icons";

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

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: SelectedItem[];
  onSelectMethod: (method: string) => void;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  selectedProducts,
  onSelectMethod,
}: PaymentMethodModalProps) {
  const totalAmount = selectedProducts
    .reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
    .toFixed(2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-[550px] rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
            💳 เลือกวิธีชำระเงิน
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            กรุณาเลือกวิธีการชำระเงินที่ต้องการ
          </p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 p-3 dark:from-emerald-950/40 dark:to-teal-950/40">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ยอดที่ต้องชำระ
            </span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ฿{totalAmount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Button
            variant="outline"
            className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all hover:border-green-500 hover:bg-green-50 hover:shadow-lg dark:hover:bg-green-950/30"
            onClick={() => {
              onSelectMethod("เงินสด");
              onClose();
            }}
          >
            <FaMoneyBillWave className="h-12 w-12 text-green-600 dark:text-green-400" />
            <span className="font-bold text-gray-800 dark:text-white">
              เงินสด
            </span>
          </Button>

          <Button
            variant="outline"
            className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg dark:hover:bg-blue-950/30"
            onClick={() => {
              onSelectMethod("QR PromptPay");
              onClose();
            }}
          >
            <FaQrcode className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-gray-800 dark:text-white">
              QR PromptPay
            </span>
          </Button>

          <Button
            variant="outline"
            className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all hover:border-purple-500 hover:bg-purple-50 hover:shadow-lg dark:hover:bg-purple-950/30"
            onClick={() => {
              onSelectMethod("บัตรเครดิต/เดบิต");
              onClose();
            }}
          >
            <FaCreditCard className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            <span className="font-bold text-gray-800 dark:text-white">
              บัตรเครดิต/เดบิต
            </span>
          </Button>
        </div>

        <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
          <Button variant="outline" className="w-full" onClick={onClose}>
            ยกเลิก
          </Button>
        </div>
      </div>
    </Modal>
  );
}
