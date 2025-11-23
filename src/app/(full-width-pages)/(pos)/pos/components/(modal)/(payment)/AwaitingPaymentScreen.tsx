"use client";
import React from "react";
import Button from "@/components/ui/button/Button";
import { FaCheckCircle } from "react-icons/fa";
import { Payment } from "./PaymentModal";

interface AwaitingPaymentScreenProps {
    totalAmount: number;
    payments: Payment[];
    onBack: () => void;
}

export default function AwaitingPaymentScreen({
    totalAmount,
    payments,
    onBack,
}: AwaitingPaymentScreenProps) {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:h-[820px] md:rounded-2xl dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-10 dark:bg-gray-800">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <FaCheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl dark:text-white">
                        บันทึกวิธีการชำระเงินสำเร็จ
                    </h2>
                    <p className="text-base text-gray-600 md:text-lg dark:text-gray-400">
                        ระบบได้บันทึกวิธีการชำระเงินแล้ว
                    </p>
                </div>

                {/* Payment Summary */}
                <div className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            ยอดชำระทั้งหมด
                        </span>
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            ฿{totalAmount.toFixed(2)}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                            วิธีการชำระเงิน:
                        </h4>
                        {payments.map((payment, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-lg bg-white p-4 dark:bg-gray-800"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                        <FaCheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {payment.method}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    ฿{payment.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                        {payments[0]?.note && (
                            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold">หมายเหตุ:</span> {payments[0].note}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="mb-8 rounded-xl bg-green-50 p-5 dark:bg-green-900/20">
                    <h4 className="mb-3 font-semibold text-green-900 dark:text-green-300">
                        ขั้นตอนต่อไป:
                    </h4>
                    <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>ข้อมูลได้ถูกบันทึกไว้ในระบบแล้ว</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>สามารถดำเนินการรับชำระเงินจากลูกค้าได้เลย</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>กดปุ่ม &quot;ย้อนกลับ&quot; หากต้องการแก้ไขวิธีการชำระเงิน</span>
                        </li>
                    </ul>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="w-full py-3 text-base font-semibold md:w-auto md:px-12"
                    >
                        ← ย้อนกลับ
                    </Button>
                </div>
            </div>
        </div>
    );
}
