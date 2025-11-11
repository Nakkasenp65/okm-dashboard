"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import {
  FaMoneyBillWave,
  FaQrcode,
  FaCreditCard,
  FaTruck,
  FaMix,
  FaUniversity,
} from "react-icons/fa";
import CashPaymentComponent, {
  CashPaymentHandle,
} from "./(payment)/CashPaymentComponent";
import TransferPaymentComponent from "./(payment)/(transfer)/TransferPaymentComponent";
import OnlinePaymentComponent from "./(payment)/OnlinePaymentComponent";
import CardPaymentComponent from "./(payment)/CardPaymentComponent";
import MixedPaymentComponent from "./(payment)/MixPaymentComponent";
import SuccessScreen from "./(payment)/SuccessScreen";
import PromptPayPaymentComponent from "./(payment)/PromptPayPaymentComponent";
import { PosMode } from "../../page";
import ConfirmationModal from "./ConfirmationModal";
import { useConfirmation } from "../../hooks/useConfirmation";

// --- Types & Interfaces ---
export type PaymentMethod =
  | "cash"
  | "transfer"
  | "online"
  | "card"
  | "credit"
  | "app"
  | "mixed"
  | "promptpay";
export interface Payment {
  method: string;
  amount: number;
  details?: Record<string, unknown>;
}

type VatCalculationMode = "off" | "included" | "excluded";
const VAT_RATE = 0.07; // 7%

interface PaymentModalProps {
  isOpen: boolean;
  mode: PosMode;
  onClose: () => void;
  totalToPay: number;
  onPaymentSuccess: (payments: Payment[], change: number) => void;
  onFinishTransaction: () => void;
  onPrintShortReceipt: () => void;
  onPrintFullReceipt: () => void;
  onSendEReceipt: () => void;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "เงินสด",
  transfer: "โอนชำระผ่านธนาคาร",
  online: "ชำระเงินออนไลน์",
  card: "ชำระด้วยบัตร",
  credit: "ลงบิลเชื่อ",
  app: "ชำระผ่านแอปพลิเคชัน",
  mixed: "ชำระเงินแบบผสม",
  promptpay: "พร้อมเพย์",
};

const retailTabs = [
  { id: "cash", label: "เงินสด", icon: FaMoneyBillWave },
  { id: "transfer", label: "ธนาคาร", icon: FaUniversity },
  { id: "promptpay", label: "พร้อมเพย์", icon: FaQrcode },
  { id: "online", label: "ออนไลน์", icon: FaQrcode },
  { id: "card", label: "บัตร", icon: FaCreditCard },
  { id: "app", label: "แอป", icon: FaTruck },
  { id: "mixed", label: "ผสม", icon: FaMix },
];

const companyTabs = [
  { id: "cash", label: "เงินสด", icon: FaMoneyBillWave },
  { id: "transfer", label: "ธนาคาร", icon: FaUniversity },
  { id: "promptpay", label: "พร้อมเพย์", icon: FaQrcode },
  { id: "mixed", label: "ผสม", icon: FaMix },
  { id: "app", label: "แอป", icon: FaTruck },
];

export default function PaymentModal({
  isOpen,
  mode,
  onClose,
  totalToPay,
  onPaymentSuccess,
  onFinishTransaction,
  onPrintShortReceipt,
  onPrintFullReceipt,
  onSendEReceipt,
}: PaymentModalProps) {
  const tabsToDisplay = mode === "retail" ? retailTabs : companyTabs;
  const [activeTab, setActiveTab] = useState<PaymentMethod>(
    tabsToDisplay[0].id as PaymentMethod,
  );
  const [paymentStep, setPaymentStep] = useState<"paying" | "success">(
    "paying",
  );
  const [vatMode, setVatMode] = useState<VatCalculationMode>("off");

  const cashPaymentRef = useRef<CashPaymentHandle>(null);
  const [mixedPayments, setMixedPayments] = useState<Payment[]>([]);

  const confirmation = useConfirmation();

  const { subTotalBeforeVat, vatAmount, grandTotal } = useMemo(() => {
    switch (vatMode) {
      case "included":
        const includedGrandTotal = totalToPay;
        const includedSubTotal = totalToPay / (1 + VAT_RATE);
        const includedVatAmount = includedGrandTotal - includedSubTotal;
        return {
          subTotalBeforeVat: includedSubTotal,
          vatAmount: includedVatAmount,
          grandTotal: includedGrandTotal,
        };
      case "excluded":
        const excludedSubTotal = totalToPay;
        const excludedVatAmount = totalToPay * VAT_RATE;
        const excludedGrandTotal = excludedSubTotal + excludedVatAmount;
        return {
          subTotalBeforeVat: excludedSubTotal,
          vatAmount: excludedVatAmount,
          grandTotal: excludedGrandTotal,
        };
      case "off":
      default:
        return {
          subTotalBeforeVat: totalToPay,
          vatAmount: 0,
          grandTotal: totalToPay,
        };
    }
  }, [totalToPay, vatMode]);

  const totalPaidInMix = useMemo(
    () => mixedPayments.reduce((sum, p) => sum + p.amount, 0),
    [mixedPayments],
  );
  const remainingInMix = grandTotal - totalPaidInMix;

  useEffect(() => {
    if (isOpen) {
      const currentTabs = mode === "retail" ? retailTabs : companyTabs;
      setPaymentStep("paying");
      setActiveTab(currentTabs[0].id as PaymentMethod);
      setMixedPayments([]);
      setVatMode("off");
      cashPaymentRef.current?.reset();
    }
  }, [isOpen, mode]);

  const handleConfirmPayment = () => {
    // If the active tab is 'card', do nothing, as its confirmation is handled internally.
    if (activeTab === "card") {
      return;
    }

    let finalPayments: Payment[] = [];
    let finalChange = 0;
    const amountToPay = grandTotal;

    switch (activeTab) {
      case "cash":
        const cashReceived = cashPaymentRef.current?.getCashReceived() ?? 0;
        const change = cashPaymentRef.current?.getChange() ?? 0;
        if (cashReceived < amountToPay) {
          confirmation.showConfirmation({
            title: "จำนวนเงินไม่พอ",
            message: "กรุณาใส่จำนวนเงินให้ครบตามยอดที่ต้องชำระ",
            type: "warning",
            confirmText: "ตกลง",
            showCancel: false,
          });
          return;
        }
        finalPayments.push({
          method: PAYMENT_METHOD_LABELS.cash,
          amount: amountToPay,
        });
        finalChange = change;
        break;
      case "transfer":
      case "online":
      // 'card' case is removed from here as it's handled internally
      case "credit":
      case "app":
      case "promptpay":
        finalPayments.push({
          method: PAYMENT_METHOD_LABELS[activeTab],
          amount: amountToPay,
        });
        break;
      case "mixed":
        if (remainingInMix > 0.001) {
          confirmation.showConfirmation({
            title: "ยังชำระไม่ครบจำนวน",
            message: `คงเหลือจำนวนเงินที่ต้องชำระอีก ${remainingInMix.toFixed(
              2,
            )} บาท`,
            type: "warning",
            confirmText: "ตกลง",
            showCancel: false,
          });
          return;
        }
        finalPayments = mixedPayments;
        finalChange = Math.abs(remainingInMix);
        break;
    }

    onPaymentSuccess(finalPayments, finalChange);
    setPaymentStep("success");
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        showCloseButton={false}
        className="h-[80vh] w-full max-w-6xl rounded-2xl p-0 shadow-2xl"
      >
        {paymentStep === "success" ? (
          <SuccessScreen
            changeAmount={
              activeTab === "cash"
                ? (cashPaymentRef.current?.getChange() ?? 0)
                : activeTab === "mixed"
                  ? Math.abs(remainingInMix)
                  : 0
            }
            onFinishTransaction={onFinishTransaction}
            onPrintShortReceipt={onPrintShortReceipt}
            onPrintFullReceipt={onPrintFullReceipt}
            onSendEReceipt={onSendEReceipt}
          />
        ) : (
          <div className="flex h-full bg-gray-50 dark:bg-gray-900">
            {/* Left Panel: Payment Method Selection */}
            <div className="flex w-3/5 flex-col border-r border-gray-200 dark:border-gray-700/50">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
                  เลือกวิธีการชำระเงิน
                </h2>
                <div className="grid grid-cols-7 gap-3">
                  {tabsToDisplay.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl p-3 font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? "scale-105 bg-blue-500 text-white shadow-lg"
                          : "bg-gray-200/50 text-gray-700 hover:bg-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <tab.icon size={24} />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-100/30 dark:bg-black/20">
                {activeTab === "cash" && (
                  <CashPaymentComponent
                    ref={cashPaymentRef}
                    totalToPay={grandTotal}
                  />
                )}
                {activeTab === "transfer" && (
                  <TransferPaymentComponent totalToPay={grandTotal} />
                )}
                {activeTab === "promptpay" && (
                  <PromptPayPaymentComponent totalToPay={grandTotal} />
                )}
                {activeTab === "online" && (
                  <OnlinePaymentComponent totalToPay={grandTotal} />
                )}
                {activeTab === "card" && (
                  <CardPaymentComponent
                    totalToPay={grandTotal}
                    onPaymentSuccess={onPaymentSuccess}
                  />
                )}
                {activeTab === "mixed" && (
                  <MixedPaymentComponent
                    totalToPay={grandTotal}
                    payments={mixedPayments}
                    onPaymentsChange={setMixedPayments}
                  />
                )}
                {["credit", "app"].includes(activeTab) && (
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                    <span className="text-6xl">
                      {activeTab === "credit" ? "📝" : "📱"}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {PAYMENT_METHOD_LABELS[activeTab]}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      ส่วนนี้จะแสดงข้อมูล/แบบฟอร์ม
                      <br />
                      ที่เกี่ยวข้องกับการชำระเงินประเภทนี้
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Right Panel: Summary */}
            <div className="flex w-2/5 flex-col justify-between bg-white p-8 dark:bg-gray-800/50">
              <div>
                <h3 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
                  สรุปยอดชำระ
                </h3>
                <div className="mb-6">
                  <h4 className="text-md mb-3 font-semibold text-gray-700 dark:text-gray-300">
                    การคำนวณภาษีมูลค่าเพิ่ม (VAT)
                  </h4>
                  <div className="flex rounded-lg bg-gray-200/60 p-1 dark:bg-gray-900/70">
                    {(
                      ["off", "included", "excluded"] as VatCalculationMode[]
                    ).map((mode, index) => (
                      <Button
                        key={mode}
                        variant={vatMode === mode ? "primary" : "outline"}
                        onClick={() => setVatMode(mode)}
                        className="w-full text-sm font-semibold transition-all"
                      >
                        {["ไม่คิด VAT", "ราคารวม VAT", "ราคาบวก VAT"][index]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-gray-200 bg-white/50 p-5 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-700/30">
                  {vatMode !== "off" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          ยอดก่อนภาษี
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {subTotalBeforeVat.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          ภาษี (7%)
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {vatAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 dark:border-gray-600" />
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                      ยอดรวมสุทธิ
                    </span>
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ฿{grandTotal.toFixed(2)}
                    </span>
                  </div>

                  {activeTab === "mixed" && (
                    <div className="border-t border-gray-200 pt-3 dark:border-gray-600">
                      <div className="flex justify-between py-1 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          ชำระแล้ว
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ฿{totalPaidInMix.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          คงเหลือ
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            remainingInMix > 0.001
                              ? "text-red-500"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          ฿{remainingInMix.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3 pt-6">
                <Button
                  onClick={handleConfirmPayment}
                  disabled={
                    (activeTab === "mixed" && remainingInMix > 0.001) ||
                    activeTab === "card"
                  }
                  className={`w-full py-4 text-lg font-bold transition-all duration-300 ${
                    (activeTab === "mixed" && remainingInMix > 0.001) ||
                    activeTab === "card"
                      ? "cursor-not-allowed bg-gray-400 opacity-50 dark:bg-gray-600"
                      : "bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl"
                  }`}
                >
                  ยืนยันการชำระเงิน
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full py-3 font-semibold text-gray-600 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                >
                  ปิด
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.hideConfirmation}
        onConfirm={confirmation.config.onConfirm}
        title={confirmation.config.title}
        message={confirmation.config.message}
        type={confirmation.config.type}
        confirmText={confirmation.config.confirmText}
        cancelText={confirmation.config.cancelText}
        showCancel={confirmation.config.showCancel}
      />
    </>
  );
}
