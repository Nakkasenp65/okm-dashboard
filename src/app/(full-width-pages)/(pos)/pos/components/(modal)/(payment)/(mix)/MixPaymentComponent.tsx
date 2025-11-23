"use client";

import React, { useState, useMemo } from "react";
import { Payment, PaymentMethod, PAYMENT_METHOD_LABELS } from "../PaymentModal";
import { PlannedPayment } from "./MixedPaymentTypes";
import PlanningView from "./PlanningView";
import AddingView from "./AddingView";

interface MixedPaymentComponentProps {
  totalToPay: number; // Passed from PaymentModal (the precise calculated Amount)
  payments: Payment[]; // The 'Actual' list from PaymentModal
  onPaymentsChange: (newPayments: Payment[]) => void;
}

export default function MixedPaymentComponent({
  totalToPay,
  payments,
  onPaymentsChange,
}: MixedPaymentComponentProps) {
  const [mode, setMode] = useState<"planning" | "adding">("planning");
  const [methodToAdd, setMethodToAdd] = useState<PaymentMethod | null>(null);

  // Map Parent Payments (Plain objects) to UI items (PlannedPayment with ID)
  // We use the index as ID seed because strict equality check might fail on generic objects
  const uiPayments: PlannedPayment[] = useMemo(() => {
    return payments.map((p, idx) => ({
      id: `pay-${idx}-${Date.now()}`,
      method: PAYMENT_METHOD_LABELS[p.method as PaymentMethod] || p.method,
      methodKey: (p.method as PaymentMethod), 
      amount: p.amount,
    }));
  }, [payments]);

  const totalAllocated = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingToAllocate = Math.max(0, totalToPay - totalAllocated);

  const handleStartAdding = (method: PaymentMethod) => {
    setMethodToAdd(method);
    setMode("adding");
  };

  const handleConfirmAdd = (amountStr: string) => {
    const amount = parseFloat(amountStr);
    
    // Basic validation
    if (isNaN(amount) || amount <= 0) return;

    // Create standard Payment object

    
    // BUT PaymentModal `handleNextStep` -> `case 'mixed'` -> `finalPayments = mixedPayments`.
    // And `case 'cash'` -> `finalPayments.push(..., PAYMENT_METHOD_LABELS.cash ...)`
    // So to be consistent with Single Payment, mixed items should probably use LABEL?
    // Let's stick to using the KEY in the object, and ensure backend/modal handles it, 
    // OR map it here. Let's Map it to Label here to match single payment behavior.
    
    const finalMethodString = methodToAdd ?? "unknown";

    const paymentToAdd: Payment = {
        method: finalMethodString, 
        amount: amount
    };

    onPaymentsChange([...payments, paymentToAdd]);
    setMode("planning");
    setMethodToAdd(null);
  };

  const handleRemovePayment = (indexToRemove: number) => {
    const newPayments = payments.filter((_, idx) => idx !== indexToRemove);
    onPaymentsChange(newPayments);
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900">
      {mode === "planning" && (
        <PlanningView
          totalToPay={totalToPay}
          remainingToAllocate={remainingToAllocate}
          plannedPayments={uiPayments}
          onRemovePlan={(id) => {
             // Find index by matching ID from uiPayments to original index
             const idx = uiPayments.findIndex(p => p.id === id);
             if(idx !== -1) handleRemovePayment(idx);
          }}
          onStartAdding={handleStartAdding}
        />
      )}

      {mode === "adding" && (
        <AddingView
          methodToAdd={methodToAdd}
          remainingToAllocate={remainingToAllocate}
          initialAmount={remainingToAllocate > 0 ? remainingToAllocate.toFixed(2) : ""}
          onCancel={() => setMode("planning")}
          onConfirm={handleConfirmAdd}
        />
      )}
    </div>
  );
}