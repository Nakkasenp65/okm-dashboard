"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { BiReceipt } from "@/icons";
import Image from "next/image";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscountModal({ isOpen, onClose }: DiscountModalProps) {
  // Mock discount data
  const mockDiscounts = [
    {
      id: 1,
      name: "ส่วนลดเทศกาลปีใหม่",
      description: "ลดราคา 20% สำหรับสินค้าทุกชนิดในช่วงเทศกาลปีใหม่",
      duration: "1 ม.ค. - 31 ม.ค. 2025",
      discountType: "percentage",
      value: 20,
    },
    {
      id: 2,
      name: "ส่วนลดสมาชิก VIP",
      description: "ส่วนลดพิเศษสำหรับสมาชิก VIP ลด 15% จากราคาปกติ",
      duration: "ตลอดทั้งปี",
      discountType: "percentage",
      value: 15,
    },
    {
      id: 3,
      name: "ส่วนลดวันเกิด",
      description: "ส่วนลด 50 บาท สำหรับลูกค้าที่มีวันเกิดในเดือนนี้",
      duration: "เฉพาะเดือนเกิด",
      discountType: "fixed",
      value: 50,
    },
    {
      id: 4,
      name: "ส่วนลดซื้อครบ 500 บาท",
      description: "ลด 10% เมื่อซื้อสินค้าครบ 500 บาทขึ้นไป",
      duration: "ทุกวัน",
      discountType: "percentage",
      value: 10,
    },
    {
      id: 5,
      name: "ส่วนลดสินค้าโปรโมชั่น",
      description: "ส่วนลดพิเศษสำหรับสินค้าโปรโมชั่น ลด 30 บาท",
      duration: "15 พ.ย. - 15 ธ.ค. 2025",
      discountType: "fixed",
      value: 30,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="w-full max-w-[800px] rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          {/* Discount details */}
          <div id="discount-details" className="mt-4">
            {/* Instructions */}
            <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
              <h6 className="mb-4 text-2xl font-semibold text-blue-900 dark:text-blue-100">
                คำแนะนำการใช้งานส่วนลด
              </h6>
              <ul className="grid grid-cols-2 gap-4 space-y-1 text-lg text-blue-800 dark:text-blue-200">
                <li className="flex flex-col items-center justify-center rounded-2xl border-4 border-blue-800 p-4">
                  <Image
                    width={200}
                    height={200}
                    src="/images/assets/scan.png"
                    className="w-24"
                    alt="Scan"
                  />
                  <span className="text-2xl">แสกน QR ส่วนลด</span>
                </li>
                <li className="flex flex-col items-center justify-center rounded-2xl border-4 border-blue-800 p-4">
                  <Image
                    width={200}
                    height={200}
                    src="/images/assets/type.png"
                    className="w-24"
                    alt="Input"
                  />
                  <span className="text-2xl">กรอกโค้ดส่วนลดด้านล่าง</span>
                </li>
              </ul>
            </div>
            <div className="mb-4">
              <div className="max-h-60 space-y-3 overflow-y-auto">
                {mockDiscounts.map((discount) => (
                  <div
                    key={discount.id}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h6 className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {discount.name}
                        </h6>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {discount.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-lg text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <BiReceipt className="h-3 w-3" />
                            ระยะเวลา: {discount.duration}
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {discount.discountType === "percentage"
                              ? `ลด ${discount.value}%`
                              : `ลด ${discount.value} บาท`}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button variant="outline" size="sm" className="text-lg">
                          เลือก
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Discount Field */}
          <div className="mt-4 flex flex-col gap-2 text-xl">
            <label className="text-lg font-medium" htmlFor="discount">
              กรอกโค้ดส่วนลด (หรือเลือกจากด้านบน)
            </label>
            <input
              id="discount"
              name="discount"
              type="text"
              placeholder="เช่น: NEWYEAR2025, VIP15, BIRTHDAY50"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full py-3 text-base font-medium"
          >
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-base font-semibold shadow-lg transition-all hover:from-blue-600 hover:to-purple-700"
          >
            ใช้ส่วนลด
          </Button>
        </div>
      </div>
    </Modal>
  );
}
