/**
 * ตัวอย่าง Component ใบเสร็จ Thermal Printer แบบง่าย
 * รองรับ 58mm, 80mm และ A5
 */

"use client";
import React, { useRef } from "react";
import { printReceiptToPDF } from "../../utils/printUtils";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface SimpleThermalReceiptProps {
  shopName?: string;
  shopAddress?: string;
  taxId?: string;
  receiptNumber?: string;
  items?: ReceiptItem[];
  subtotal?: number;
  discount?: number;
  total?: number;
  paperSize?: "58mm" | "80mm" | "A5";
}

/**
 * Component สำหรับแสดงและพิมพ์ใบเสร็จ
 */
export default function SimpleThermalReceipt({
  shopName = "ร้านค้าของเรา",
  shopAddress = "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
  taxId = "0-1234-56789-01-2",
  receiptNumber = `RCP${Date.now()}`,
  items = [
    { name: "สินค้า A", quantity: 2, price: 10.0 },
    { name: "สินค้า B", quantity: 1, price: 50.0 },
    { name: "สินค้า C", quantity: 3, price: 15.0 },
  ],
  subtotal = 115.0,
  discount = 11.5,
  total = 103.5,
  paperSize = "80mm",
}: SimpleThermalReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = React.useState<
    "58mm" | "80mm" | "A5"
  >(paperSize);

  const handlePrint = async () => {
    if (!receiptRef.current) {
      alert("ไม่สามารถพิมพ์ได้ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    try {
      await printReceiptToPDF(
        receiptRef.current,
        `receipt-${receiptNumber}.pdf`,
        { pageSize: selectedSize },
      );
    } catch (error) {
      console.error("Error printing:", error);
      alert(`เกิดข้อผิดพลาด: ${error}`);
    }
  };

  // กำหนดขนาดและสไตล์ตามกระดาษที่เลือก
  const sizeConfig = {
    "58mm": {
      width: "w-[58mm]",
      fontSize: "text-[9px]",
      lineHeight: "leading-tight",
      padding: "p-[2mm]",
    },
    "80mm": {
      width: "w-[80mm]",
      fontSize: "text-[11px]",
      lineHeight: "leading-normal",
      padding: "p-[3mm]",
    },
    A5: {
      width: "w-[148mm]",
      fontSize: "text-[11px]",
      lineHeight: "leading-relaxed",
      padding: "p-[8mm]",
    },
  }[selectedSize];

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gray-100 p-8 dark:bg-gray-900">
      {/* ส่วนควบคุม */}
      <div className="w-full max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          ตัวอย่างใบเสร็จ Thermal Printer
        </h1>

        {/* เลือกขนาดกระดาษ */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            เลือกขนาดกระดาษ
          </label>
          <div className="flex gap-2">
            {(["58mm", "80mm", "A5"] as const).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  selectedSize === size
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* ปุ่มพิมพ์ */}
        <button
          onClick={handlePrint}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          🖨️ พิมพ์ใบเสร็จ
        </button>

        {/* คำอธิบาย */}
        <div className="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-900/20">
          <p className="font-semibold text-blue-800 dark:text-blue-300">
            💡 วิธีใช้งาน:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-blue-700 dark:text-blue-400">
            <li>เลือกขนาดกระดาษที่ต้องการ (58mm, 80mm หรือ A5)</li>
            <li>กดปุ่ม &ldquo;พิมพ์ใบเสร็จ&rdquo; เพื่อเปิด Print Dialog</li>
            <li>เลือก Thermal Printer ของคุณ</li>
            <li>ตรวจสอบให้แน่ใจว่าขนาดกระดาษตรงกับที่เลือก</li>
            <li>กดพิมพ์!</li>
          </ul>
        </div>
      </div>

      {/* Preview ใบเสร็จ */}
      <div className="rounded-lg bg-gray-200 p-8 shadow-inner dark:bg-black/50">
        <div
          ref={receiptRef}
          className={` ${sizeConfig.width} ${sizeConfig.fontSize} ${sizeConfig.lineHeight} ${sizeConfig.padding} bg-white font-sans text-black shadow-2xl`}
        >
          {/* Header ร้านค้า */}
          <div className="mb-3 space-y-1 text-center">
            <div className="text-lg font-bold">{shopName}</div>
            <div className="text-sm break-words whitespace-pre-wrap">
              {shopAddress}
            </div>
            <div className="text-sm">เลขประจำตัวผู้เสียภาษี</div>
            <div className="text-sm font-medium">{taxId}</div>
          </div>

          {/* เส้นแบ่ง */}
          <div className="my-2 border-t-2 border-black"></div>

          {/* ข้อมูลใบเสร็จ */}
          <div className="mb-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>เลขที่:</span>
              <span className="font-medium">{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>วันที่:</span>
              <span className="font-medium">
                {new Date().toLocaleString("th-TH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* เส้นประ */}
          <div className="my-2 border-t border-dashed border-gray-400"></div>

          {/* รายการสินค้า */}
          <div className="mb-2 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-medium">
                  {idx + 1}. {item.name}
                </div>
                <div className="flex justify-between pl-4 text-sm">
                  <span>
                    {item.price.toFixed(2)} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {(item.price * item.quantity).toFixed(2)} บาท
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* เส้นประ */}
          <div className="my-2 border-t border-dashed border-gray-400"></div>

          {/* สรุปยอด */}
          <div className="mb-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>รวมเป็นเงิน</span>
              <span>{subtotal.toFixed(2)} บาท</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>
                  ส่วนลด ({((discount / subtotal) * 100).toFixed(0)}%)
                </span>
                <span>-{discount.toFixed(2)} บาท</span>
              </div>
            )}
          </div>

          {/* เส้นหนา */}
          <div className="my-2 border-t-2 border-black"></div>

          {/* ยอดรวมทั้งหมด */}
          <div className="mb-2 flex justify-between text-lg font-bold">
            <span>รวมทั้งสิ้น</span>
            <span>{total.toFixed(2)} บาท</span>
          </div>

          {/* เส้นหนา */}
          <div className="my-2 border-t-2 border-black"></div>

          {/* ข้อมูลการชำระเงิน */}
          <div className="mb-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>ชำระด้วย:</span>
              <span className="font-medium">เงินสด</span>
            </div>
            <div className="flex justify-between">
              <span>รับเงิน:</span>
              <span className="font-medium">200.00 บาท</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>เงินทอน:</span>
              <span>{(200 - total).toFixed(2)} บาท</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 border-t border-gray-300 pt-3 text-center text-sm">
            <div className="font-medium">*** ขอบคุณที่ใช้บริการ ***</div>
            <div className="mt-1 text-xs text-gray-600">
              Thank you for your business
            </div>
          </div>
        </div>
      </div>

      {/* ข้อมูลเทคนิค */}
      <div className="w-full max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          ข้อมูลเทคนิค
        </h2>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex justify-between border-b py-2 dark:border-gray-700">
            <span className="font-medium">ขนาดกระดาษ:</span>
            <span>{selectedSize}</span>
          </div>
          <div className="flex justify-between border-b py-2 dark:border-gray-700">
            <span className="font-medium">ความกว้าง (Width):</span>
            <span>
              {
                {
                  "58mm": "58mm (2.28 inch)",
                  "80mm": "80mm (3.15 inch)",
                  A5: "148mm (5.83 inch)",
                }[selectedSize]
              }
            </span>
          </div>
          <div className="flex justify-between border-b py-2 dark:border-gray-700">
            <span className="font-medium">ขนาดฟอนต์:</span>
            <span>
              {
                {
                  "58mm": "9px",
                  "80mm": "11px",
                  A5: "11px",
                }[selectedSize]
              }
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Padding:</span>
            <span>
              {
                {
                  "58mm": "2mm",
                  "80mm": "3mm",
                  A5: "8mm",
                }[selectedSize]
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
