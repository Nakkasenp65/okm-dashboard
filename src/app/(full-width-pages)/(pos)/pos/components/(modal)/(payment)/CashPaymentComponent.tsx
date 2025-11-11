"use client";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import Button from "@/components/ui/button/Button";

interface CashPaymentProps {
  totalToPay: number;
}

// Interface for functions that the parent component can call
export interface CashPaymentHandle {
  getCashReceived: () => number;
  getChange: () => number;
  reset: () => void;
}

const CashPaymentComponent = forwardRef<CashPaymentHandle, CashPaymentProps>(
  ({ totalToPay }, ref) => {
    const [cashReceived, setCashReceived] = useState("");

    const cashReceivedNum = parseFloat(cashReceived) || 0;
    const change =
      cashReceivedNum >= totalToPay ? cashReceivedNum - totalToPay : 0;

    // --- Handlers ---
    const handleInput = (value: string) => {
      if (value === "clear") {
        setCashReceived("");
        return;
      }
      if (value === "del") {
        setCashReceived((prev) => prev.slice(0, -1));
        return;
      }
      if (value === "." && cashReceived.includes(".")) {
        return;
      }
      setCashReceived((prev) => prev + value);
    };

    const handleQuickPay = (amount: number) => {
      setCashReceived(amount.toString());
    };

    // --- Keyboard Event Listener ---
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (/^[0-9.]$/.test(event.key)) {
          setCashReceived((prev) => {
            if (event.key === "." && prev.includes(".")) {
              return prev;
            }
            return prev + event.key;
          });
        } else if (event.key === "Backspace") {
          setCashReceived((prev) => prev.slice(0, -1));
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    // --- Expose functions to parent component ---
    useImperativeHandle(ref, () => ({
      getCashReceived: () => cashReceivedNum,
      getChange: () => change,
      reset: () => setCashReceived(""),
    }));

    const numpadKeys = [
      "7",
      "8",
      "9",
      "4",
      "5",
      "6",
      "1",
      "2",
      "3",
      ".",
      "0",
      "⌫",
    ];

    const quickPayButtons = [
      { label: "ยอดพอดี", amount: totalToPay },
      { label: "฿100", amount: 100 },
      { label: "฿500", amount: 500 },
      { label: "฿1000", amount: 1000 },
    ];

    return (
      <div className="flex h-full gap-8 p-8 dark:from-gray-800 dark:to-gray-900">
        {/* Left side: Summary */}
        <div className="flex w-1/2 flex-col gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-8">
              <p className="mb-2 text-base font-semibold text-gray-500 dark:text-gray-400">
                จำนวนที่ต้องชำระ
              </p>
              <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                ฿{totalToPay.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl dark:from-blue-900/30 dark:to-blue-800/30">
              <label
                htmlFor="cash-received-input"
                className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                รับเงินมา
              </label>
              <input
                id="cash-received-input"
                type="text"
                readOnly
                value={`฿ ${cashReceived || "0.00"}`}
                className="w-full rounded-lg border-2 border-blue-300 bg-white p-4 text-right text-2xl font-bold text-blue-600 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-blue-600 dark:bg-gray-700 dark:text-blue-400"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-4 shadow-sm dark:border-gray-700 dark:from-green-900/30 dark:to-green-800/30">
            <p className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
              เงินทอน
            </p>
            <p
              className={`text-3xl font-bold transition-colors ${change > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}
            >
              ฿{change.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Right side: Input Area */}
        <div className="flex w-1/2 flex-col gap-6">
          {/* Quick Pay Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {quickPayButtons.map(({ label, amount }) => (
              <Button
                key={label}
                variant={cashReceivedNum === amount ? "primary" : "outline"}
                className="h-20 rounded-xl text-base font-bold shadow-sm transition-all hover:shadow-md"
                onClick={() => handleQuickPay(amount)}
              >
                {label}
              </Button>
            ))}
          </div>
          {/* Numpad */}
          <div className="grid flex-1 grid-cols-3 gap-2">
            {numpadKeys.map((key) => (
              <Button
                key={key}
                variant="outline"
                className="rounded-xl text-2xl font-bold shadow-sm transition-all hover:bg-gray-100 hover:shadow-md dark:hover:bg-gray-700"
                onClick={() => handleInput(key === "⌫" ? "del" : key)}
              >
                {key}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            className="h-16 rounded-xl text-lg font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:shadow-md dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={() => handleInput("clear")}
          >
            ล้าง (Clear)
          </Button>
        </div>
      </div>
    );
  },
);

CashPaymentComponent.displayName = "CashPaymentComponent";

export default CashPaymentComponent;
