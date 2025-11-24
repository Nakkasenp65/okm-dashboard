"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { FaMoneyBillWave, FaQrcode, FaCreditCard, FaTruck, FaMix, FaUniversity, FaPencilAlt } from "react-icons/fa";
import ConfirmationModal from "../ConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";
import MixedPaymentComponent from "./(mix)/MixPaymentComponent";
import CardPaymentComponent from "./CardPaymentComponent";
import OnlinePaymentComponent from "./OnlinePaymentComponent";
import PromptPayPaymentComponent from "./PromptPayPaymentComponent";
import TransferPaymentComponent from "./(transfer)/TransferPaymentComponent";
import CashPaymentComponent, { CashPaymentHandle } from "./CashPaymentComponent";
import MixedPaymentExecution from "./(mix)/MixedPaymentExecution";
import SuccessScreen from "./SuccessScreen";
import { useConfirmation } from "../../../hooks/useConfirmation";
import { VatCalculationMode } from "../../../types/Receipt";
import { PosMode } from "../../../page";


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
  
  // Action Handlers (Async)
  onCancelTransaction: () => Promise<void>; 
  onSavePaymentMethods: (payments: Payment[]) => Promise<void>;
  onConfirmPayment: (payment: Payment, amount: number) => Promise<void>; // New prop
  isSaving?: boolean; 

  totalToPay: number;
  
  // Legacy/Success Handlers
  onPaymentSuccess: (payments: Payment[], change: number) => void;
  onFinishTransaction: () => void;
  onPrintShortReceipt: () => void;
  onPrintFullReceipt: () => void;
  onSendEReceipt: () => void;
  
  // Tax/Vat State
  vatMode: VatCalculationMode;
  setVatMode: (mode: VatCalculationMode) => void;
  withholdingTaxPercent: number;
  setWithholdingTaxPercent: (percent: number) => void;
  withholdingTaxVatMode: "pre-vat" | "post-vat";
  setWithholdingTaxVatMode: (mode: "pre-vat" | "post-vat") => void;
  
  // UI State
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  isTaxInvoice: boolean;
  setIsTaxInvoice: (value: boolean) => void;
  
  initialPayments?: Payment[];
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

// --- Helper Components ---

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

// --- Main Component ---

export default function PaymentModal({
  isOpen,
  mode,
  onClose,
  
  onCancelTransaction,
  onSavePaymentMethods,
  onConfirmPayment, // Destructure new prop
  isSaving = false,

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
  
  initialPayments = [],
}: PaymentModalProps) {
  const tabsToDisplay = mode === "retail" ? retailTabs : companyTabs;
  const [paymentStep, setPaymentStep] = useState<"selecting" | "awaiting" | "success">("selecting");
  const [note, setNote] = useState("");
  
  // Local loading state for cancellation confirmation
  const [isCanceling, setIsCanceling] = useState(false);

  const cashPaymentRef = useRef<CashPaymentHandle>(null);
  const [mixedPayments, setMixedPayments] = useState<Payment[]>([]);
  
  // Final chosen methods to be passed to "Awaiting" or "Success"
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<Payment[]>([]);

  const confirmation = useConfirmation();

  // --- Logic & Calculations ---
  
  const { subTotalBeforeVat, vatAmount, grandTotal } = useMemo(() => {
    switch (vatMode) {
      case "included":
        const includedSubTotal = totalToPay / (1 + VAT_RATE);
        const includedVatAmount = totalToPay - includedSubTotal;
        return {
          subTotalBeforeVat: includedSubTotal,
          vatAmount: includedVatAmount,
          grandTotal: totalToPay,
        };
      case "excluded":
        const excludedVatAmount = totalToPay * VAT_RATE;
        return {
          subTotalBeforeVat: totalToPay,
          vatAmount: excludedVatAmount,
          grandTotal: totalToPay + excludedVatAmount,
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

  const { withholdingTaxAmount } = useMemo(() => {
    if (withholdingTaxPercent <= 0) return { withholdingTaxAmount: 0 };
    const amount = subTotalBeforeVat * (withholdingTaxPercent / 100);
    return { withholdingTaxAmount: amount };
  }, [withholdingTaxPercent, subTotalBeforeVat]);

  const finalPaymentAmount =
    withholdingTaxVatMode === "pre-vat"
      ? grandTotal - withholdingTaxAmount
      : grandTotal + withholdingTaxAmount;

  const totalPaidInMix = useMemo(() => mixedPayments.reduce((sum, p) => sum + p.amount, 0), [mixedPayments]);
  const remainingInMix = Math.max(0, finalPaymentAmount - totalPaidInMix);
  const isMixComplete = remainingInMix < 0.01;

  // --- Initialization ---
  useEffect(() => {
    if (isOpen) {
      // Only reset step when modal opens
      setPaymentStep("selecting");
      setNote("");
      setSelectedPaymentMethods([]);
      cashPaymentRef.current?.reset();
      
      // Initial load of payments
      if (initialPayments.length > 0) {
        setPaymentMethod("mixed");
        setMixedPayments(initialPayments);
      } else {
        const currentTabs = mode === "retail" ? retailTabs : companyTabs;
        setPaymentMethod(currentTabs[0].id as PaymentMethod);
        setMixedPayments([]);
      }
    }
  }, [isOpen, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync initialPayments when they change (e.g. after save/restore)
  useEffect(() => {
    if (isOpen && initialPayments.length > 0) {
        setMixedPayments(initialPayments);
        // Also update selectedPaymentMethods if we are in mixed mode or restoring
        if (paymentMethod === 'mixed' || paymentStep === 'awaiting') {
            setSelectedPaymentMethods(initialPayments);
            if (paymentStep === 'selecting') {
                 setPaymentStep('awaiting');
            }
        }
    }
  }, [isOpen, initialPayments, paymentMethod, paymentStep]);

  // --- Handlers ---

  const handleCancelClick = () => {
    confirmation.showConfirmation({
        title: "ยกเลิกรายการ?",
        message: "การกระทำนี้จะลบรายการชำระเงินที่บันทึกไว้ในระบบทั้งหมด คุณแน่ใจหรือไม่?",
        type: "warning",
        confirmText: "ใช่, ยกเลิกรายการ",
        cancelText: "ปิดหน้าต่าง",
        showCancel: true,
        onConfirm: async () => {
            try {
                setIsCanceling(true);
                await onCancelTransaction();
                
                // Reset State
                setPaymentStep("selecting");
                setMixedPayments([]);
                setSelectedPaymentMethods([]);
                setNote("");
                cashPaymentRef.current?.reset();
                
                onClose();
            } catch (error) {
                console.error("Cancel failed", error);
                // Error handling usually in parent
            } finally {
                setIsCanceling(false);
            }
        }
    });
  };

  const handleSaveAndContinue = () => {
    let finalPayments: Payment[] = [];
    const amountToPay = finalPaymentAmount;

    const createPaymentObject = (method: string, amount: number): Payment => {
      const payment: Payment = { method, amount };
      if (note.trim() !== "") payment.note = note.trim();
      return payment;
    };

    switch (paymentMethod) {
      case "cash":
        const cashReceived = cashPaymentRef.current?.getCashReceived() ?? 0;
        if (cashReceived < amountToPay) {
          confirmation.showConfirmation({ 
            title: "จำนวนเงินไม่พอ", 
            message: "กรุณาใส่จำนวนเงินให้ครบตามยอดที่ต้องชำระ", 
            type: "warning", confirmText: "ตกลง", showCancel: false 
          });
          return;
        }
        finalPayments.push(createPaymentObject(PAYMENT_METHOD_LABELS.cash, amountToPay));
        break;
      case "mixed":
        if (!isMixComplete) {
          confirmation.showConfirmation({
             title: "ยอดชำระไม่ครบ", 
             message: `ขาดอีก ${remainingInMix.toFixed(2)} บาท กรุณาเพิ่มวิธีการชำระเงิน`, 
             type: "warning", confirmText: "ตกลง", showCancel: false 
          });
          return;
        }
        finalPayments = mixedPayments.map((p) => ({
          ...p,
          ...(note.trim() !== "" && { note: note.trim() }),
        }));
        break;
      case "card":
        // Card flow logic usually triggers distinct UI, skipped here
        return; 
      default:
        finalPayments.push(createPaymentObject(PAYMENT_METHOD_LABELS[paymentMethod], amountToPay));
    }

    // Summary for Confirmation
    const paymentSummary = finalPayments.map(p => `• ${p.method}: ฿${p.amount.toFixed(2)}`).join("\n");
    const summaryMessage = `
ยอดชำระสุทธิ: ฿${finalPaymentAmount.toFixed(2)}

วิธีการชำระเงิน:
${paymentSummary}

ต้องการบันทึกการชำระเงินหรือไม่?
    `.trim();

    confirmation.showConfirmation({
      title: "บันทึกรายการชำระเงิน",
      message: summaryMessage,
      type: "info",
      confirmText: "บันทึก",
      cancelText: "กลับ",
      showCancel: true,
      onConfirm: async () => {
        setSelectedPaymentMethods(finalPayments);
        
        try {
            // 1. Call API
            await onSavePaymentMethods(finalPayments);
            
            // 2. If Successful, Move to "Awaiting Confirmation" Step
            // This screen will list the saved payments and allow checking status individually
            setPaymentStep("awaiting");
        } catch {
            // Parent page handles toast/error logic
        }
      },
    });
  };

  // Button State Logic
  const isButtonDisabled = useMemo(() => {
    if (paymentMethod === "card") return true; 
    if (paymentMethod === "mixed") return !isMixComplete; 
    return false;
  }, [paymentMethod, isMixComplete]);

  // Logic to disable tax editing if payments exist
  const isTaxEditable = useMemo(() => {
      // Disable if there are mixed payments (saved or unsaved)
      // This prevents changing the total after payments have been added
      return mixedPayments.length === 0;
  }, [mixedPayments]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        showCloseButton={false}
        className="no-scrollbar w-full rounded-none shadow-2xl md:h-full md:max-h-[820px] md:max-w-7xl 2xl:rounded-2xl"
      >
        {/* --- SCREEN 3: SUCCESS --- */}
        {paymentStep === "success" ? (
          <SuccessScreen
            changeAmount={
                paymentMethod === "cash" ? (cashPaymentRef.current?.getChange() ?? 0) : 0
            }
            onFinishTransaction={onFinishTransaction}
            onPrintShortReceipt={onPrintShortReceipt}
            onPrintFullReceipt={onPrintFullReceipt}
            onSendEReceipt={onSendEReceipt}
          />
        ) 
        /* --- SCREEN 2: EXECUTION / AWAITING PAYMENT --- */
        : paymentStep === "awaiting" ? (
          <MixedPaymentExecution
            payments={selectedPaymentMethods}
            totalAmount={finalPaymentAmount}
            onCancelTransaction={async () => {
                // MixedPaymentExecution already shows confirmation, so just do the cancellation
                try {
                    setIsCanceling(true);
                    await onCancelTransaction();
                    
                    // Reset State
                    setPaymentStep("selecting");
                    setMixedPayments([]);
                    setSelectedPaymentMethods([]);
                    setNote("");
                    cashPaymentRef.current?.reset();
                    
                    onClose();
                } catch (error) {
                    console.error("Cancel failed", error);
                } finally {
                    setIsCanceling(false);
                }
            }}
            onConfirmPayment={async (index: number, amount: number) => {
                const payment = selectedPaymentMethods[index];
                if (!payment) return;

                try {
                    // Call the prop to confirm via API
                    await onConfirmPayment(payment, amount);

                    // Update local state to mark as success
                    const updated = [...selectedPaymentMethods];
                    updated[index] = {
                        ...updated[index],
                        amount: amount, // Update amount in case it was edited
                        details: { ...updated[index].details, status: "SUCCESS" }
                    };
                    setSelectedPaymentMethods(updated);

                    // Check if all complete
                    const allComplete = updated.every(p => (p.details as { status?: string })?.status === "SUCCESS");
                    if (allComplete) {
                        setTimeout(() => {
                            onPaymentSuccess(updated, 0); 
                        }, 500);
                    }
                } catch (error) {
                    console.error("Failed to confirm payment", error);
                    // Error handling (toast etc) should be in parent or here
                }
            }}
            onUpdatePayment={(index: number, newAmount: number) => {
                const updated = [...selectedPaymentMethods];
                updated[index] = { ...updated[index], amount: newAmount };
                setSelectedPaymentMethods(updated);
            }}

            onRemovePayment={(index: number) => {
                // For now, just remove from local list.
                // If API support is needed, we should add onRemovePayment prop.
                const updated = selectedPaymentMethods.filter((_, i) => i !== index);
                setSelectedPaymentMethods(updated);
                if (updated.length === 0) {
                    setPaymentStep("selecting");
                }
            }}

          />
        ) 
        /* --- SCREEN 1: SELECTING METHODS --- */
        : (
          <div className="flex h-screen flex-col md:h-[820px] 2xl:rounded-2xl dark:bg-gray-900">
            
            {/* Content Body */}
            <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
              
              {/* Left Column: Method Selection */}
              <div className="flex w-full flex-col border-b border-gray-200 md:w-3/5 md:border-r md:border-b-0 dark:border-gray-700/50">
                <div className="border-b border-gray-200 p-3 md:p-5 dark:border-gray-700/50">
                  <h2 className="mb-2 text-lg font-bold text-gray-800 md:mb-3 md:text-xl dark:text-white">
                    เลือกวิธีการชำระเงิน
                  </h2>
                  <div className="no-scrollbar grid auto-cols-max grid-flow-col gap-2 overflow-x-auto p-1 md:grid-cols-7">
                    {tabsToDisplay.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPaymentMethod(tab.id as PaymentMethod)}
                        className={`flex w-20 flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 font-semibold transition-all duration-200 md:w-auto ${
                          paymentMethod === tab.id
                            ? "scale-105 bg-blue-500 text-white"
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
                    {paymentMethod === "mixed" ? (
                      <MixedPaymentComponent
                        totalToPay={finalPaymentAmount}
                        payments={mixedPayments}
                        onPaymentsChange={setMixedPayments}
                      />
                    ) : paymentMethod === "cash" ? (
                      <CashPaymentComponent ref={cashPaymentRef} totalToPay={finalPaymentAmount} />
                    ) : paymentMethod === "transfer" ? (
                      <TransferPaymentComponent totalToPay={finalPaymentAmount} />
                    ) : paymentMethod === "online" ? (
                      <OnlinePaymentComponent totalToPay={finalPaymentAmount} />
                    ) : paymentMethod === "promptpay" ? (
                      <PromptPayPaymentComponent totalToPay={finalPaymentAmount} />
                    ) : paymentMethod === "card" ? (
                      <CardPaymentComponent totalToPay={finalPaymentAmount} onPaymentSuccess={onPaymentSuccess} />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
                        <h3 className="text-xl font-bold text-gray-700 md:text-2xl dark:text-gray-300">
                          {PAYMENT_METHOD_LABELS[paymentMethod]}
                        </h3>
                      </div>
                    )}
                </div>
              </div>

              {/* Right Column: Summary & Actions */}
              <div className="flex w-full flex-col md:w-2/5 dark:bg-gray-800/50">
                <div className="no-scrollbar flex-1 overflow-y-auto p-3 md:p-6">
                  <h3 className="mb-3 text-lg font-bold text-gray-800 md:mb-5 md:text-2xl dark:text-white">
                    สรุปยอดชำระ
                  </h3>

                  {/* Tax Option */}
                  <div className={`mb-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:mb-5 dark:border-gray-700 dark:bg-gray-800 ${!isTaxEditable ? "opacity-50 pointer-events-none" : ""}`}>
                    <label className="flex cursor-pointer items-center justify-between">
                      <span className="text-base font-semibold text-gray-800 dark:text-gray-200">ออกใบกำกับภาษี</span>
                      <input
                        type="checkbox"
                        checked={isTaxInvoice}
                        onChange={(e) => setIsTaxInvoice(e.target.checked)}
                        disabled={!isTaxEditable}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  {/* Expanded Tax Controls */}
                  <AnimatePresence>
                    {isTaxInvoice && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className={`overflow-hidden ${!isTaxEditable ? "opacity-50 pointer-events-none" : ""}`}
                      >
                         <div className="mb-3 md:mb-5">
                          <h4 className="mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                            การคำนวณภาษีมูลค่าเพิ่ม (VAT)
                          </h4>
                          <div className="flex gap-1 rounded-lg p-1">
                             {vatModes.map(({ mode, label }) => (
                               <Button
                                  key={mode}
                                  variant={vatMode === mode ? "primary" : "outline"}
                                  onClick={() => setVatMode(mode)}
                                  disabled={!isTaxEditable}
                                  className="flex-1 text-xs"
                               >
                                 {label}
                               </Button>
                             ))}
                          </div>
                         </div>
                         
                         {/* Withholding Tax Sub-section */}
                         <div className="mb-3 md:mb-5">
                            <label className="mb-2 flex cursor-pointer items-center justify-between">
                                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">ภาษีหัก ณ ที่จ่าย</span>
                                <input 
                                    type="checkbox" 
                                    checked={withholdingTaxPercent > 0} 
                                    onChange={(e) => setWithholdingTaxPercent(e.target.checked ? 3 : 0)} 
                                    disabled={!isTaxEditable}
                                    className="h-4 w-4" 
                                />
                            </label>
                            {withholdingTaxPercent > 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 rounded-lg border p-2 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">เปอร์เซ็นต์ (%)</span>
                                        <input 
                                            type="number" 
                                            value={withholdingTaxPercent} 
                                            onChange={(e) => setWithholdingTaxPercent(Number(e.target.value))} 
                                            disabled={!isTaxEditable}
                                            className="w-16 rounded border p-1 text-right" 
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant={withholdingTaxVatMode === "pre-vat" ? "primary" : "outline"} onClick={() => setWithholdingTaxVatMode("pre-vat")} disabled={!isTaxEditable} className="flex-1 text-xs">ยอดก่อน VAT</Button>
                                        <Button variant={withholdingTaxVatMode === "post-vat" ? "primary" : "outline"} onClick={() => setWithholdingTaxVatMode("post-vat")} disabled={!isTaxEditable} className="flex-1 text-xs">ยอดรวม VAT</Button>
                                    </div>
                                </motion.div>
                            )}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <NoteInputSection value={note} onChange={(e) => setNote(e.target.value)} />

                  {/* Financial Summary Box */}
                  <div className="space-y-2 rounded-xl border border-gray-200 bg-gradient-to-br from-white/80 to-gray-50/50 p-3 shadow-sm backdrop-blur-sm md:space-y-3 md:p-5 dark:border-gray-700/50 dark:from-gray-700/30 dark:to-gray-800/30">
                    <div className="flex justify-between text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        <span>มูลค่าก่อนภาษี</span>
                        <span>฿{subTotalBeforeVat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        <span>ภาษี (7%)</span>
                        <span>฿{vatAmount.toFixed(2)}</span>
                    </div>
                    
                    {withholdingTaxPercent > 0 && (
                      <div className="flex justify-between text-xs md:text-sm text-red-600 dark:text-red-400">
                        <span>WHT ({withholdingTaxPercent}%)</span>
                        <span>(-{withholdingTaxAmount.toFixed(2)})</span>
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
                          <span className={`text-base font-bold md:text-lg ${remainingInMix > 0.001 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                            ฿{remainingInMix.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 p-2 dark:border-gray-700/50 dark:bg-gray-800/50">
              <Button
                onClick={handleCancelClick}
                variant="outline"
                disabled={isCanceling || isSaving}
                className={`w-auto px-6 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200/50 md:py-2.5 md:text-base dark:text-gray-400 dark:hover:bg-gray-700/50 ${isCanceling ? "opacity-50" : ""}`}
              >
                {isCanceling ? "กำลังยกเลิก..." : "ยกเลิก"}
              </Button>
              
              <Button
                onClick={handleSaveAndContinue}
                disabled={isButtonDisabled || isSaving || isCanceling}
                className={`w-auto px-8 py-3 text-sm font-bold transition-all duration-300 md:py-3.5 md:text-base
                  ${isButtonDisabled || isSaving || isCanceling
                    ? "cursor-not-allowed bg-gray-400 opacity-50 dark:bg-gray-600"
                    : paymentMethod === "mixed"
                      ? "bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl"
                      : "bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl"
                  }`}
              >
                {isSaving 
                    ? "กำลังบันทึกข้อมูล..." 
                    : paymentMethod === "mixed" 
                        ? "บันทึกและยืนยันการชำระเงิน" 
                        : "ยืนยันการชำระเงิน"
                }
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