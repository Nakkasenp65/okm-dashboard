"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaList, FaChevronRight, FaMoneyBillWave, FaQrcode, FaCreditCard, FaUniversity, FaTruck, FaEdit, FaTrash } from "react-icons/fa";
import Button from "@/components/ui/button/Button";
import { Payment, PAYMENT_METHOD_LABELS } from "../PaymentModal";
import { useConfirmation } from "../../../../hooks/useConfirmation";
import ConfirmationModal from "../../ConfirmationModal";

// --- Icons Map ---
const METHOD_ICONS: Record<string, React.ElementType> = {
  cash: FaMoneyBillWave,
  transfer: FaUniversity,
  promptpay: FaQrcode,
  online: FaQrcode,
  card: FaCreditCard,
  credit: FaCreditCard,
  app: FaTruck,
  mixed: FaList,
};

interface MixedPaymentExecutionProps {
  payments: Payment[];
  totalAmount: number;
  onCancelTransaction: () => Promise<void>;
  onConfirmPayment: (paymentIndex: number, amount: number) => Promise<void>; // Confirm individual payment
  onUpdatePayment: (index: number, newAmount: number) => void;
  onRemovePayment: (index: number) => void;
}

export default function MixedPaymentExecution({
  payments,
  totalAmount,
  onCancelTransaction,
  onConfirmPayment,
  onUpdatePayment,
  onRemovePayment,
}: MixedPaymentExecutionProps) {
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editMethod, setEditMethod] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const confirmation = useConfirmation();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Find the first pending payment to scroll to
  const activeIndex = useMemo(() => {
    return payments.findIndex(p => (p.details as { status?: string })?.status !== "SUCCESS");
  }, [payments]);

  // Auto-scroll to center the active card
  useEffect(() => {
    if (activeIndex !== -1 && scrollContainerRef.current && cardRefs.current[activeIndex]) {
      const container = scrollContainerRef.current;
      const activeCard = cardRefs.current[activeIndex];
      
      if (activeCard) {
        const containerRect = container.getBoundingClientRect();
        const cardRect = activeCard.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const offset = cardCenter - containerCenter;
        
        container.scrollTo({
          left: container.scrollLeft + offset,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);
  
  const handleConfirmClick = async (index: number, amount: number) => {
    await onConfirmPayment(index, amount);
  };

  const handleCancelClick = () => {
    confirmation.showConfirmation({
      title: "ยกเลิกรายการทั้งหมด?",
      message: "การกระทำนี้จะยกเลิกรายการชำระเงินทั้งหมดที่บันทึกไว้และปิดหน้านี้ คุณแน่ใจหรือไม่?",
      type: "warning",
      confirmText: "ใช่, ยกเลิกทั้งหมด",
      cancelText: "ไม่, กลับไปชำระเงิน",
      showCancel: true,
      onConfirm: async () => {
        await onCancelTransaction();
      },
    });
  };

  const handleStartEdit = (idx: number, method: string, amount: number) => {
    setEditingIndex(idx);
    setEditMethod(method);
    setEditAmount(amount);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      onUpdatePayment(editingIndex, editAmount);
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleDeleteClick = (index: number) => {
    confirmation.showConfirmation({
      title: "ลบรายการ?",
      message: "คุณต้องการลบรายการชำระเงินนี้ใช่หรือไม่?",
      type: "warning",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
      showCancel: true,
      onConfirm: () => {
        onRemovePayment(index);
      },
    });
  };

  console.log("payments", payments);

  // Calculate totals
  const totalPaid = useMemo(() => {
    return payments
      .filter(p => (p.details as { status?: string })?.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const remainingAmount = Math.max(0, totalAmount - totalPaid);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-50 md:h-[820px] md:rounded-2xl dark:bg-gray-900">
      
      {/* --- Header / Top Bar --- */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">แบ่งชำระเงิน</h2>
            <div className="mt-2 flex gap-4 text-lg">
                <span className="font-semibold text-gray-500 dark:text-gray-400">
                    ยอดรวม: <span className="text-gray-800 dark:text-white">฿{totalAmount.toFixed(2)}</span>
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                    ชำระแล้ว: ฿{totalPaid.toFixed(2)}
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                    คงเหลือ: ฿{remainingAmount.toFixed(2)}
                </span>
            </div>
        </div>
        <Button variant="outline" onClick={() => setIsViewAllOpen(true)} className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
            <FaList className="mr-2" /> ดูรายการทั้งหมด
        </Button>
      </div>

      {/* --- Main Content: Horizontal Card Layout --- */}
      <div ref={scrollContainerRef} className="flex flex-1 items-center p-4 overflow-x-auto no-scrollbar">
        <AnimatePresence mode="popLayout">
          {payments.length > 0 ? (
            <div 
              className="flex gap-6"
              style={{ 
                paddingLeft: 'calc(50% - 160px)', 
                paddingRight: 'calc(50% - 160px)',
                width: 'max-content' 
              }}
            >
              {payments.map((payment, idx) => {
                const isPaid = (payment.details as { status?: string })?.status === "SUCCESS";
                const PaymentIcon = METHOD_ICONS[payment.method] || FaList;
                const isEditing = editingIndex === idx;

                return (
                  <motion.div
                    key={idx}
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1, // Full opacity for all
                      scale: isEditing ? 1.05 : 1
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`flex flex-col items-center rounded-3xl p-8 shadow-2xl transition-all min-w-[340px] relative ${
                      isPaid 
                        ? "bg-green-50 border-2 border-green-200 dark:bg-green-900/20 dark:border-green-900" 
                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    {/* Edit Mode Overlay */}
                    {isEditing ? (
                       <div className="flex w-full flex-col gap-4">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">แก้ไขรายการ</h3>
                          
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-400">วิธีชำระเงิน</label>
                            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
                               <PaymentIcon className="text-gray-500" />
                               <span className="font-medium">{PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS] || payment.method}</span>
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-400">ยอดเงิน (฿)</label>
                            <input 
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(Number(e.target.value))}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg font-bold text-blue-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-blue-400"
                                autoFocus
                            />
                          </div>

                          <div className="mt-4 flex gap-3">
                            <Button onClick={handleSaveEdit} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                                บันทึก
                            </Button>
                            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                                ยกเลิก
                            </Button>
                          </div>
                       </div>
                    ) : (
                      <>
                        {/* Action Buttons for Pending Items */}
                        {!isPaid && (
                          <div className="absolute right-4 top-4 flex gap-2">
                            <button 
                              onClick={() => handleStartEdit(idx, payment.method, payment.amount)}
                              className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                              title="แก้ไข"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(idx)}
                              className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                              title="ลบ"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        )}

                        {/* Icon */}
                        <div className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
                          isPaid 
                            ? "bg-green-100 dark:bg-green-900/30" 
                            : "bg-blue-50 dark:bg-blue-900/20"
                        }`}>
                          {isPaid ? (
                            <FaCheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                          ) : (
                            <PaymentIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        
                        {/* Payment Method Label */}
                        <h3 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
                          {PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS] || payment.method}
                        </h3>
                        
                        {/* Amount */}
                        <div className={`mb-8 text-4xl font-extrabold ${
                          isPaid 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-blue-600 dark:text-blue-400"
                        }`}>
                          ฿{payment.amount.toFixed(2)}
                        </div>

                        {/* Note */}
                        {payment.note && (
                          <div className="mb-6 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            Note: {payment.note}
                          </div>
                        )}

                        {/* Status/Action */}
                        {isPaid ? (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <FaCheckCircle />
                            <span className="font-semibold">ชำระแล้ว</span>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleConfirmClick(idx, payment.amount)}
                            className="h-14 w-full rounded-xl text-lg font-bold shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            ยืนยันการรับเงิน
                          </Button>
                        )}
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center w-full">
              <div className="mb-4 rounded-full bg-green-100 p-6 dark:bg-green-900/30">
                <FaCheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ชำระเงินครบถ้วนแล้ว</h2>
              <p className="text-gray-500 dark:text-gray-400">กำลังดำเนินการเสร็จสิ้น...</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Footer: Cancel Button --- */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <Button 
            onClick={handleCancelClick}
            className="w-full  text-xl font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
        >
            ยกเลิกรายการ
        </Button>
      </div>

      {/* --- View All Drawer / Modal --- */}
      <AnimatePresence>
        {isViewAllOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 0.5 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setIsViewAllOpen(false)}
                    className="absolute inset-0 z-40 bg-black"
                />
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-800"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">รายการชำระเงินทั้งหมด</h3>
                        <button onClick={() => setIsViewAllOpen(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <FaChevronRight />
                        </button>
                    </div>
                    
                    {/* Payment List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {payments.map((p, idx) => {
                            const isPaid = (p.details as { status?: string })?.status === "SUCCESS";
                            const MethodIcon = METHOD_ICONS[p.method] || FaList;
                            const isEditing = editingIndex === idx;
                            
                            return (
                                <motion.div 
                                    key={idx} 
                                    layout
                                    className={`mb-3 rounded-xl border p-3 ${isPaid ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"}`}
                                >
                                    {isEditing && !isPaid ? (
                                        <div className="space-y-3">
                                            {/* Edit Mode */}
                                            <div>
                                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">วิธีชำระเงิน</label>
                                                <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                                                   <MethodIcon className="text-gray-500" />
                                                   <span className="text-sm font-medium">{PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS] || p.method}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">ยอดเงิน (฿)</label>
                                                <input 
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={(e) => setEditAmount(Number(e.target.value))}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={handleSaveEdit}
                                                    className="flex-1 bg-blue-600 text-sm text-white hover:bg-blue-700"
                                                >
                                                    บันทึก
                                                </Button>
                                                <Button 
                                                    variant="outline"
                                                    onClick={handleCancelEdit}
                                                    className="flex-1 text-sm"
                                                >
                                                    ยกเลิก
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isPaid ? "bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                                                    <MethodIcon size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-white">
                                                        {PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS] || p.method}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {isPaid ? "ชำระแล้ว ✓" : "รอชำระ"}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <span className={`font-bold ${isPaid ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-white"}`}>
                                                    ฿{p.amount.toFixed(2)}
                                                </span>
                                                {!isPaid && (
                                                    <div className="flex gap-1">
                                                        <button 
                                                            onClick={() => handleStartEdit(idx, p.method, p.amount)}
                                                            className="rounded p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        >
                                                            <FaEdit size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteClick(idx)}
                                                            className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Summary Section */}
                    <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                        <h4 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">สรุปยอด</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">ยอดรวม</span>
                                <span className="font-semibold text-gray-800 dark:text-white">฿{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">ชำระแล้ว</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                    ฿{payments.filter(p => (p.details as { status?: string })?.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-gray-300 pt-2 dark:border-gray-600">
                                <span className="font-bold text-gray-800 dark:text-white">คงเหลือ</span>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    ฿{(totalAmount - payments.filter(p => (p.details as { status?: string })?.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

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
    </div>
  );
}
