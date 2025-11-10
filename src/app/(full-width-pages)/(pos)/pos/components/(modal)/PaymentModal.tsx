"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import {
  FaMoneyBillWave,
  FaQrcode,
  FaCreditCard,
  FaUserTag,
  FaTruck,
  FaMix,
  FaPrint,
  FaReceipt,
  FaShareAlt,
  FaUniversity,
} from "react-icons/fa";
import CashPaymentComponent, {
  CashPaymentHandle,
} from "./(payment)/CashPaymentComponent";
import TransferPaymentComponent from "./(payment)/TransferPaymentComponent";
import OnlinePaymentComponent from "./(payment)/OnlinePaymentComponent";
import CardPaymentComponent from "./(payment)/CardPaymentComponent";
import MixedPaymentComponent from "./(payment)/MixPaymentComponent";

// --- Types & Interfaces ---
export type PaymentMethod =
  | "cash"
  | "transfer"
  | "online"
  | "card"
  | "credit"
  | "app"
  | "mixed";
export interface Payment {
  method: string;
  amount: number;
  details?: any;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalToPay: number;
  onPaymentSuccess: (payments: Payment[], change: number) => void;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "เงินสด",
  transfer: "โอนชำระผ่านธนาคาร",
  online: "ชำระเงินออนไลน์",
  card: "ชำระด้วยบัตร",
  credit: "ลงบิลเชื่อ",
  app: "ชำระผ่านแอปพลิเคชัน",
  mixed: "ชำระเงินแบบผสม",
};

export default function PaymentModal({
  isOpen,
  onClose,
  totalToPay,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = React.useState<PaymentMethod>("cash");
  const [paymentStep, setPaymentStep] = React.useState<"paying" | "success">(
    "paying",
  );

  const cashPaymentRef = React.useRef<CashPaymentHandle>(null);

  const [mixedPayments, setMixedPayments] = React.useState<Payment[]>([]);

  const totalPaidInMix = React.useMemo(
    () => mixedPayments.reduce((sum, p) => sum + p.amount, 0),
    [mixedPayments],
  );
  const remainingInMix = totalToPay - totalPaidInMix;

  React.useEffect(() => {
    if (isOpen) {
      setPaymentStep("paying");
      setActiveTab("cash");
      setMixedPayments([]);
      cashPaymentRef.current?.reset();
    }
  }, [isOpen]);

  const handleConfirmPayment = () => {
    let finalPayments: Payment[] = [];
    let finalChange = 0;

    switch (activeTab) {
      case "cash":
        const cashReceived = cashPaymentRef.current?.getCashReceived() ?? 0;
        const change = cashPaymentRef.current?.getChange() ?? 0;
        if (cashReceived < totalToPay) {
          alert("จำนวนเงินไม่พอ");
          return;
        }
        finalPayments.push({
          method: PAYMENT_METHOD_LABELS.cash,
          amount: totalToPay,
        });
        finalChange = change;
        break;
      case "transfer":
        finalPayments.push({
          method: PAYMENT_METHOD_LABELS.transfer,
          amount: totalToPay,
        });
        break;
      case "online":
        finalPayments.push({
          method: PAYMENT_METHOD_LABELS.online,
          amount: totalToPay,
        });
        break;
      case "card":
        finalPayments.push({
          method: PAYMENT_METHOD_LABELS.card,
          amount: totalToPay,
        });
        break;
      case "credit":
        finalPayments.push({
          method: PAYMENT_METHOD_LABELS.credit,
          amount: totalToPay,
        });
        break;
      case "app":
        finalPayments.push({
          method: PAYMENT_METHOD_LABELS.app,
          amount: totalToPay,
        });
        break;
      case "mixed":
        if (remainingInMix > 0.001) {
          alert("ยังชำระไม่ครบจำนวน");
          return;
        }
        finalPayments = mixedPayments;
        finalChange = Math.abs(remainingInMix);
        break;
    }

    onPaymentSuccess(finalPayments, finalChange);
    setPaymentStep("success");
  };

  const tabs = [
    { id: "cash", label: "เงินสด", icon: FaMoneyBillWave },
    { id: "transfer", label: "ธนาคาร", icon: FaUniversity },
    { id: "online", label: "ออนไลน์", icon: FaQrcode },
    { id: "card", label: "บัตร", icon: FaCreditCard },
    { id: "credit", label: "เชื่อ", icon: FaUserTag },
    { id: "app", label: "แอป", icon: FaTruck },
    { id: "mixed", label: "ผสม", icon: FaMix },
  ];

  const SuccessScreen = ({
    changeAmount,
    onCloseFinal,
  }: {
    changeAmount: number;
    onCloseFinal: () => void;
  }) => (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
        <span className="text-4xl text-green-500">✓</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        ชำระเงินสำเร็จ
      </h2>
      <p className="text-lg text-gray-500 dark:text-gray-400">เงินทอน</p>
      <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
        ฿{changeAmount.toFixed(2)}
      </p>
      <div className="my-4 w-full border-t border-gray-200 dark:border-gray-700"></div>
      <div className="w-full space-y-3">
        <Button
          variant="outline"
          className="flex w-full items-center justify-center gap-2 py-3"
        >
          <FaPrint /> พิมพ์ใบเสร็จเต็ม
        </Button>
        <Button
          variant="outline"
          className="flex w-full items-center justify-center gap-2 py-3"
        >
          <FaReceipt /> พิมพ์ใบเสร็จย่อ
        </Button>
        <Button
          variant="outline"
          className="flex w-full items-center justify-center gap-2 py-3"
        >
          <FaShareAlt /> ส่ง E-Receipt
        </Button>
      </div>
      <Button
        onClick={onCloseFinal}
        className="mt-4 w-full py-3 text-lg font-semibold"
      >
        ปิด
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="min-h-[70vh] w-full max-w-4xl rounded-xl p-0 shadow-2xl"
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
          onCloseFinal={onClose}
        />
      ) : (
        <div className="flex">
          <div className="flex w-3/4 flex-col">
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="grid grid-cols-7 gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-800">
              {activeTab === "cash" && (
                <CashPaymentComponent
                  ref={cashPaymentRef}
                  totalToPay={totalToPay}
                />
              )}
              {activeTab === "transfer" && (
                <TransferPaymentComponent totalToPay={totalToPay} />
              )}
              {activeTab === "online" && (
                <OnlinePaymentComponent totalToPay={totalToPay} />
              )}
              {activeTab === "card" && (
                <CardPaymentComponent totalToPay={totalToPay} />
              )}

              {activeTab === "mixed" && (
                <MixedPaymentComponent
                  totalToPay={totalToPay}
                  payments={mixedPayments}
                  onPaymentsChange={setMixedPayments}
                />
              )}

              {["credit", "app"].includes(activeTab) && (
                <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center text-gray-500 dark:border-gray-600">
                  <span className="text-4xl">
                    {activeTab === "credit" && "📝"}
                    {activeTab === "app" && "📱"}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    {PAYMENT_METHOD_LABELS[activeTab]}
                  </h3>
                  <p>
                    ส่วนนี้จะแสดงข้อมูล/แบบฟอร์ม
                    <br />
                    ที่เกี่ยวข้องกับการชำระเงินประเภทนี้
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex w-1/4 flex-col justify-between bg-white p-6 dark:bg-gray-900">
            <div>
              <h3 className="mb-4 text-lg font-semibold">สรุปยอดชำระ</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>ยอดรวม</span>
                  <span>{totalToPay.toFixed(2)}</span>
                </div>
                {activeTab === "mixed" && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>ชำระแล้ว</span>
                      <span>{totalPaidInMix.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>คงเหลือ</span>
                      <span>{remainingInMix.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleConfirmPayment}
                disabled={activeTab === "mixed" && remainingInMix > 0.001}
                className="w-full py-4 text-xl"
              >
                ยืนยันการชำระเงิน
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full py-3"
              >
                ปิด
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
