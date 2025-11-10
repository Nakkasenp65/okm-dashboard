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

// Interface สำหรับฟังก์ชันที่เราต้องการให้ Parent เรียกใช้
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
    const handleNumpadInput = (value: string) => {
      if (value === "clear") {
        setCashReceived("");
        return;
      }
      if (value === "del") {
        setCashReceived((prev) => prev.slice(0, -1));
        return;
      }
      // ป้องกันการใส่จุดซ้ำ
      if (value === "." && cashReceived.includes(".")) {
        return;
      }
      setCashReceived((prev) => prev + value);
    };

    // --- Keyboard Event Listener ---
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // ดักจับเฉพาะตัวเลข 0-9 และจุด
        if (/^[0-9.]$/.test(event.key)) {
          handleNumpadInput(event.key);
        } else if (event.key === "Backspace") {
          handleNumpadInput("del");
        }
        // สามารถเพิ่ม event.key === 'Enter' เพื่อ submit ได้ในอนาคต
      };

      window.addEventListener("keydown", handleKeyDown);
      // Cleanup function: ลบ listener ออกเมื่อ component unmount
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [cashReceived]); // dependency array เพื่อให้ handleNumpadInput อัปเดตเสมอ

    // --- Expose functions to parent component ---
    useImperativeHandle(ref, () => ({
      getCashReceived: () => cashReceivedNum,
      getChange: () => change,
      reset: () => setCashReceived(""),
    }));

    const numpadKeys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0"];

    return (
      <div className="flex h-full gap-4">
        {/* Left side: Summary */}
        <div className="flex w-1/2 flex-col justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                จำนวนที่ต้องชำระ:
              </p>
              <p className="text-4xl font-bold text-gray-800 dark:text-white">
                ฿{totalToPay.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">รับเงินมา:</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                ฿{cashReceivedNum.toFixed(2)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">เงินทอน:</p>
            <p className="text-5xl font-bold text-green-600 dark:text-green-400">
              ฿{change.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Right side: Numpad */}
        <div className="grid w-1/2 grid-cols-3 gap-2">
          {numpadKeys.map((key) => (
            <Button
              key={key}
              variant="outline"
              className="h-full text-2xl"
              onClick={() => handleNumpadInput(key)}
            >
              {key}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-full text-2xl"
            onClick={() => handleNumpadInput("del")}
          >
            ⌫
          </Button>
          {/* สามารถเพิ่มปุ่ม clear ได้ถ้าต้องการ */}
          {/* <Button variant="outline" className="h-16 text-xl col-span-1" onClick={() => handleNumpadInput('clear')}>C</Button> */}
        </div>
      </div>
    );
  },
);

// Set a display name for the component for better debugging
CashPaymentComponent.displayName = "CashPaymentComponent";

export default CashPaymentComponent;
