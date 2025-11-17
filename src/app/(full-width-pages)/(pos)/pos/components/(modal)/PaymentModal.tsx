"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { FaMoneyBillWave, FaQrcode, FaCreditCard, FaTruck, FaMix, FaUniversity, FaPencilAlt } from "react-icons/fa";
import CashPaymentComponent, { CashPaymentHandle } from "./(payment)/CashPaymentComponent";
import TransferPaymentComponent from "./(payment)/(transfer)/TransferPaymentComponent";
import OnlinePaymentComponent from "./(payment)/OnlinePaymentComponent";
import CardPaymentComponent from "./(payment)/CardPaymentComponent";
import MixedPaymentComponent from "./(payment)/MixPaymentComponent";
import SuccessScreen from "./(payment)/SuccessScreen";
import PromptPayPaymentComponent from "./(payment)/PromptPayPaymentComponent";
import { PosMode } from "../../page";
import ConfirmationModal from "./ConfirmationModal";
import { useConfirmation } from "../../hooks/useConfirmation";
import { AnimatePresence, motion } from "framer-motion";
import { VatCalculationMode } from "../../types/Receipt";

// --- Types & Interfaces ---
export type PaymentMethod = "cash" | "transfer" | "online" | "card" | "credit" | "app" | "mixed" | "promptpay";

export interface Payment {
  method: string;
  amount: number;
  details?: Record<string, unknown>;
  note?: string;
}

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
  vatMode: VatCalculationMode;
  setVatMode: (mode: VatCalculationMode) => void;
  withholdingTaxPercent: number;
  setWithholdingTaxPercent: (percent: number) => void;
  withholdingTaxVatMode: "pre-vat" | "post-vat";
  setWithholdingTaxVatMode: (mode: "pre-vat" | "post-vat") => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  isTaxInvoice: boolean;
  setIsTaxInvoice: (value: boolean) => void;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "เงินสด",
  transfer: "โอนชำระผ่านธนาคาร",
  online: "ชำระเงินออนไลน์",
  card: "ชำระด้วยบัตร",
  credit: "ลงบิลเชื่อ",
  app: "ชำระผ่านแอปพลิเคชัน",
  mixed: "ชำระเงินแบบผสม",
  promptpay: "พร้อมเพย์",
};

interface NoteInputSectionProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const NoteInputSection: React.FC<NoteInputSectionProps> = ({ value, onChange }) => {
  return (
    <div className="mb-3 md:mb-5">
      <label
        htmlFor="payment-note"
        className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-700 dark:text-gray-300"
      >
        <FaPencilAlt className="text-base" />
        หมายเหตุ (Note / Remark)
      </label>
      <textarea
        id="payment-note"
        value={value}
        onChange={onChange}
        rows={2}
        placeholder="ระบุรายละเอียดเพิ่มเติม"
        className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
};

const retailTabs = [
  { id: "cash", label: "เงินสด", icon: FaMoneyBillWave },
  { id: "transfer", label: "ธนาคาร", icon: FaUniversity },
  { id: "promptpay", label: "พร้อมเพย์", icon: FaQrcode },
  { id: "online", label: "E-wallet", icon: FaQrcode },
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

const vatModes: { mode: VatCalculationMode; label: string; short: string }[] = [
  { mode: "included", label: "ราคารวม VAT", short: "รวม" },
  { mode: "excluded", label: "ราคาบวก VAT", short: "บวก" },
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
  vatMode,
  setVatMode,
  withholdingTaxPercent,
  setWithholdingTaxPercent,
  withholdingTaxVatMode,
  setWithholdingTaxVatMode,
  paymentMethod,
  setPaymentMethod,
  isTaxInvoice,
  setIsTaxInvoice,
}: PaymentModalProps) {
  const tabsToDisplay = mode === "retail" ? retailTabs : companyTabs;
  const [paymentStep, setPaymentStep] = useState<"paying" | "success">("paying");
  const [note, setNote] = useState("");

  const cashPaymentRef = useRef<CashPaymentHandle>(null);
  const [mixedPayments, setMixedPayments] = useState<Payment[]>([]);

  const confirmation = useConfirmation();

  useEffect(() => {
    if (!isTaxInvoice) {
      setWithholdingTaxPercent(0);
    }
  }, [isTaxInvoice, setWithholdingTaxPercent]);

  const { subTotalBeforeVat, vatAmount, grandTotal } = useMemo(() => {
    if (!isTaxInvoice) {
      return {
        subTotalBeforeVat: totalToPay,
        vatAmount: 0,
        grandTotal: totalToPay,
      };
    }
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
  }, [totalToPay, vatMode, isTaxInvoice]);

  const { withholdingTaxAmount } = useMemo(() => {
    if (!isTaxInvoice || withholdingTaxPercent <= 0) {
      return { withholdingTaxAmount: 0 };
    }
    const baseForWHT = withholdingTaxVatMode === "pre-vat" ? subTotalBeforeVat : grandTotal;
    const amount = baseForWHT * (withholdingTaxPercent / 100);
    return { withholdingTaxAmount: amount };
  }, [isTaxInvoice, withholdingTaxPercent, withholdingTaxVatMode, subTotalBeforeVat, grandTotal]);

  const finalPaymentAmount = grandTotal - withholdingTaxAmount;

  const totalPaidInMix = useMemo(() => mixedPayments.reduce((sum, p) => sum + p.amount, 0), [mixedPayments]);

  const remainingInMix = finalPaymentAmount - totalPaidInMix;

  useEffect(() => {
    if (isOpen) {
      const currentTabs = mode === "retail" ? retailTabs : companyTabs;
      setPaymentStep("paying");
      setPaymentMethod(currentTabs[0].id as PaymentMethod);
      setMixedPayments([]);
      setNote("");
      setIsTaxInvoice(false);
      setVatMode("included");
      cashPaymentRef.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode]);

  const handleConfirmPayment = () => {
    if (paymentMethod === "card") {
      return;
    }

    let finalPayments: Payment[] = [];
    let finalChange = 0;
    const amountToPay = finalPaymentAmount;

    const createPaymentObject = (method: string, amount: number): Payment => {
      const payment: Payment = { method, amount };
      if (note.trim() !== "") {
        payment.note = note.trim();
      }
      return payment;
    };

    switch (paymentMethod) {
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
        finalPayments.push(createPaymentObject(PAYMENT_METHOD_LABELS.cash, amountToPay));
        finalChange = change;
        break;
      case "transfer":
      case "online":
      case "credit":
      case "app":
      case "promptpay":
        finalPayments.push(createPaymentObject(PAYMENT_METHOD_LABELS[paymentMethod], amountToPay));
        break;
      case "mixed":
        if (remainingInMix > 0.001) {
          confirmation.showConfirmation({
            title: "ยังชำระไม่ครบจำนวน",
            message: `คงเหลือจำนวนเงินที่ต้องชำระอีก ${remainingInMix.toFixed(2)} บาท`,
            type: "warning",
            confirmText: "ตกลง",
            showCancel: false,
          });
          return;
        }
        finalPayments = mixedPayments.map((p) => ({
          ...p,
          ...(note.trim() !== "" && { note: note.trim() }),
        }));
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
        className="no-scrollbar w-full rounded-none shadow-2xl md:h-full md:max-h-[820px] md:max-w-7xl md:rounded-2xl"
      >
        {paymentStep === "success" ? (
          <SuccessScreen
            changeAmount={
              paymentMethod === "cash"
                ? (cashPaymentRef.current?.getChange() ?? 0)
                : paymentMethod === "mixed"
                  ? Math.abs(remainingInMix)
                  : 0
            }
            onFinishTransaction={onFinishTransaction}
            onPrintShortReceipt={onPrintShortReceipt}
            onPrintFullReceipt={onPrintFullReceipt}
            onSendEReceipt={onSendEReceipt}
          />
        ) : (
          <div className="flex h-screen flex-col bg-gray-50 md:h-[820px] md:rounded-2xl dark:bg-gray-900">
            <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
              <div className="flex w-full flex-col border-b border-gray-200 md:w-3/5 md:border-r md:border-b-0 dark:border-gray-700/50">
                <div className="border-b border-gray-200 p-3 md:p-5 dark:border-gray-700/50">
                  <h2 className="mb-2 text-lg font-bold text-gray-800 md:mb-3 md:text-xl dark:text-white">
                    เลือกวิธีการชำระเงิน
                  </h2>
                  {/* === KEY CHANGE HERE for Mobile View === */}
                  <div className="no-scrollbar grid auto-cols-max grid-flow-col gap-2 overflow-x-auto pb-2 md:grid-cols-7">
                    {tabsToDisplay.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPaymentMethod(tab.id as PaymentMethod)}
                        className={`flex w-20 flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 font-semibold transition-all duration-200 md:w-auto ${
                          paymentMethod === tab.id
                            ? "scale-105 bg-blue-500 text-white shadow-lg"
                            : "bg-gray-200/50 text-gray-700 hover:bg-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        <tab.icon size={18} className="md:h-[22px] md:w-[22px]" />
                        <span className="text-xs leading-tight">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-100/30 dark:bg-black/20">
                  {paymentMethod === "cash" && (
                    <CashPaymentComponent ref={cashPaymentRef} totalToPay={finalPaymentAmount} />
                  )}
                  {paymentMethod === "transfer" && <TransferPaymentComponent totalToPay={finalPaymentAmount} />}
                  {paymentMethod === "promptpay" && <PromptPayPaymentComponent totalToPay={finalPaymentAmount} />}
                  {paymentMethod === "online" && <OnlinePaymentComponent totalToPay={finalPaymentAmount} />}
                  {paymentMethod === "card" && (
                    <CardPaymentComponent totalToPay={finalPaymentAmount} onPaymentSuccess={onPaymentSuccess} />
                  )}
                  {paymentMethod === "mixed" && (
                    <MixedPaymentComponent
                      totalToPay={finalPaymentAmount}
                      payments={mixedPayments}
                      onPaymentsChange={setMixedPayments}
                    />
                  )}
                  {["credit", "app"].includes(paymentMethod) && (
                    <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center md:p-8">
                      <span className="text-4xl md:text-6xl">{paymentMethod === "credit" ? "📝" : "📱"}</span>
                      <h3 className="text-xl font-bold text-gray-700 md:text-2xl dark:text-gray-300">
                        {PAYMENT_METHOD_LABELS[paymentMethod]}
                      </h3>
                      <p className="text-sm text-gray-600 md:text-base dark:text-gray-400">
                        ส่วนนี้จะแสดงข้อมูล/แบบฟอร์ม
                        <br />
                        ที่เกี่ยวข้องกับการชำระเงินประเภทนี้
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-col md:w-2/5 dark:bg-gray-800/50">
                <div className="flex-1 overflow-y-auto p-3 md:p-6">
                  <h3 className="mb-3 text-lg font-bold text-gray-800 md:mb-5 md:text-2xl dark:text-white">
                    สรุปยอดชำระ
                  </h3>

                  <div className="mb-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:mb-5 dark:border-gray-700 dark:bg-gray-800">
                    <label className="flex cursor-pointer items-center justify-between">
                      <span className="text-base font-semibold text-gray-800 dark:text-gray-200">ออกใบกำกับภาษี</span>
                      <input
                        type="checkbox"
                        checked={isTaxInvoice}
                        onChange={(e) => setIsTaxInvoice(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  <AnimatePresence>
                    {isTaxInvoice && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="mb-3 md:mb-5">
                          <h4 className="mb-2 text-base font-semibold text-gray-700 md:mb-3 md:text-base dark:text-gray-300">
                            การคำนวณภาษีมูลค่าเพิ่ม (VAT)
                          </h4>
                          <div className="flex gap-1 rounded-lg p-1 md:gap-1.5">
                            {vatModes.map(({ mode, label, short }) => (
                              <Button
                                key={mode}
                                variant={vatMode === mode ? "primary" : "outline"}
                                onClick={() => setVatMode(mode)}
                                className="flex-1 py-1.5 text-[10px] font-semibold transition-all md:py-2 md:text-base"
                              >
                                <span className="hidden sm:inline">{label}</span>
                                <span className="sm:hidden">{short}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-3 md:mb-5">
                          <label className="mb-2 flex cursor-pointer items-center justify-between md:mb-3">
                            <span className="text-base font-semibold text-gray-700 md:text-base dark:text-gray-300">
                              ภาษีหัก ณ ที่จ่าย
                            </span>
                            <input
                              type="checkbox"
                              checked={withholdingTaxPercent > 0}
                              onChange={(e) => setWithholdingTaxPercent(e.target.checked ? 3 : 0)}
                              className="h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                            />
                          </label>
                          {withholdingTaxPercent > 0 && (
                            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 bg-white p-2 md:space-y-3 md:p-3 dark:border-gray-700/50 dark:bg-gray-800/30">
                              <div>
                                <label className="mb-1 block text-[10px] font-medium text-gray-600 md:mb-1.5 md:text-xs dark:text-gray-400">
                                  เปอร์เซ็นต์ (%)
                                </label>
                                <input
                                  type="number"
                                  value={withholdingTaxPercent}
                                  onChange={(e) => setWithholdingTaxPercent(Number(e.target.value))}
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  className="w-full rounded-md border-gray-300 p-2 text-right text-xs shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 md:text-sm dark:border-gray-600 dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-[10px] font-medium text-gray-600 md:mb-1.5 md:text-xs dark:text-gray-400">
                                  คำนวณจาก
                                </label>
                                <div className="flex gap-1 md:gap-1.5">
                                  <Button
                                    variant={withholdingTaxVatMode === "pre-vat" ? "primary" : "outline"}
                                    onClick={() => setWithholdingTaxVatMode("pre-vat")}
                                    className="flex-1 py-1.5 text-[10px] font-semibold md:text-xs"
                                  >
                                    ยอดก่อน VAT
                                  </Button>
                                  <Button
                                    variant={withholdingTaxVatMode === "post-vat" ? "primary" : "outline"}
                                    onClick={() => setWithholdingTaxVatMode("post-vat")}
                                    className="flex-1 py-1.5 text-[10px] font-semibold md:text-xs"
                                  >
                                    ยอดรวม VAT
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <NoteInputSection value={note} onChange={(e) => setNote(e.target.value)} />

                  <div className="space-y-2 rounded-xl border border-gray-200 bg-gradient-to-br from-white/80 to-gray-50/50 p-3 shadow-sm backdrop-blur-sm md:space-y-3 md:p-5 dark:border-gray-700/50 dark:from-gray-700/30 dark:to-gray-800/30">
                    {isTaxInvoice && (
                      <>
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">มูลค่าก่อนภาษี</span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            ฿{subTotalBeforeVat.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">ภาษี (7%)</span>
                          <span className="font-semibold text-gray-800 dark:text-white">฿{vatAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 dark:border-gray-600" />
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-gray-700 dark:text-gray-300">ยอดรวม</span>
                          <span className="text-gray-800 dark:text-white">฿{grandTotal.toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    {isTaxInvoice && withholdingTaxPercent > 0 && (
                      <div className="flex justify-between text-xs text-red-600 md:text-sm dark:text-red-400">
                        <span className="">ภาษีหัก ณ ที่จ่าย {withholdingTaxPercent}%</span>
                        <span className="font-semibold">(-{withholdingTaxAmount.toFixed(2)})</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-300 pt-2 dark:border-gray-600">
                      <span className="text-sm font-bold text-gray-800 md:text-base dark:text-white">ยอดชำระสุทธิ</span>
                      <span className="text-2xl font-bold text-blue-600 md:text-3xl dark:text-blue-400">
                        ฿{finalPaymentAmount.toFixed(2)}
                      </span>
                    </div>

                    {paymentMethod === "mixed" && (
                      <div className="border-t border-gray-200 pt-2 md:pt-3 dark:border-gray-600">
                        <div className="flex justify-between py-1 text-xs md:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">ชำระแล้ว</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ฿{totalPaidInMix.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-sm font-bold text-gray-700 md:text-base dark:text-gray-300">
                            คงเหลือ
                          </span>
                          <span
                            className={`text-base font-bold md:text-lg ${
                              remainingInMix > 0.001 ? "text-red-500" : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            ฿{remainingInMix.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 p-2 dark:border-gray-700/50 dark:bg-gray-800/50">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-auto px-6 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200/50 md:py-2.5 md:text-base dark:text-gray-400 dark:hover:bg-gray-700/50"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={(paymentMethod === "mixed" && remainingInMix > 0.001) || paymentMethod === "card"}
                className={`w-auto px-8 py-3 text-sm font-bold transition-all duration-300 md:py-3.5 md:text-base ${
                  (paymentMethod === "mixed" && remainingInMix > 0.001) || paymentMethod === "card"
                    ? "cursor-not-allowed bg-gray-400 opacity-50 dark:bg-gray-600"
                    : "bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl"
                }`}
              >
                ยืนยันการชำระเงิน
              </Button>
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
