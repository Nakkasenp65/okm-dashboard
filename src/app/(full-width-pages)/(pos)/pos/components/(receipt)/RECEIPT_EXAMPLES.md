# ตัวอย่างใบเสร็จ Thermal Printer

## 🎯 โครงสร้างใบเสร็จมาตรฐาน

### ใบเสร็จ 80mm (Standard)

```
================================
       ร้านค้าของเรา
   123 ถนนสุขุมวิท กรุงเทพฯ
   เลขประจำตัวผู้เสียภาษี:
        0-1234-56789-01-2
================================

เลขที่: IV24/01-00001
วันที่: 12/11/2025 14:30:25
ผู้ออกบิล: พนักงาน A

--------------------------------
รายการสินค้า
--------------------------------
1. สินค้า A
   10.00 x 2        20.00 บาท
2. สินค้า B
   50.00 x 1        50.00 บาท
--------------------------------
รวมเป็นเงิน           70.00 บาท
ส่วนลด -10%           -7.00 บาท
================================
รวมทั้งสิ้น           63.00 บาท
================================

ชำระด้วย: เงินสด
รับเงิน:              100.00 บาท
เงินทอน:               37.00 บาท

*** ขอบคุณที่ใช้บริการ ***
```

### ใบเสร็จ 58mm (Compact)

```
========================
    ร้านค้าของเรา
 123 ถนนสุขุมวิท
    กรุงเทพฯ
  Tax ID: 0-1234-56789
========================

No: IV24/01-00001
Date: 12/11/25 14:30
Staff: พนักงาน A

------------------------
1. สินค้า A
   10.00x2    20.00฿
2. สินค้า B
   50.00x1    50.00฿
------------------------
Subtotal      70.00฿
Disc -10%     -7.00฿
========================
TOTAL         63.00฿
========================

Cash         100.00฿
Change        37.00฿

*** Thank You ***
```

### ใบกำกับภาษี A5

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    ใบกำกับภาษีอย่างย่อ
                    TAX INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ผู้ประกอบการ (Seller):
    บริษัท ร้านค้าของเรา จำกัด
    123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110
    เลขประจำตัวผู้เสียภาษี: 0-1234-56789-01-2
    สาขา: สำนักงานใหญ่

ผู้ซื้อ (Buyer):
    ลูกค้าทั่วไป

เลขที่เอกสาร: IV24/01-00001
วันที่: 12 พฤศจิกายน 2568

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ลำดับ | รายการ           | จำนวน | ราคา/หน่วย | จำนวนเงิน
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1   | สินค้า A         |   2   |   10.00    |   20.00
  2   | สินค้า B         |   1   |   50.00    |   50.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                                  รวมเป็นเงิน    70.00 บาท
                                  ส่วนลด -10%    -7.00 บาท
                                  ────────────────────────
                                  รวมก่อน VAT    63.00 บาท
                                  VAT 7%          0.00 บาท
                                  ════════════════════════
                                  รวมทั้งสิ้น    63.00 บาท
                                  ════════════════════════

ผู้ออกบิล: พนักงาน A

              ขอบคุณที่ใช้บริการ
```

## 💻 โค้ด React Component

### ตัวอย่างการใช้งานพื้นฐาน

```tsx
import React, { useRef } from "react";
import { printReceiptToPDF } from "./utils/printUtils";

export default function SimpleReceiptPrinter() {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [paperSize, setPaperSize] = useState<"58mm" | "80mm" | "A5">("80mm");

  const handlePrint = async () => {
    if (!receiptRef.current) return;

    await printReceiptToPDF(receiptRef.current, `receipt-${Date.now()}.pdf`, {
      pageSize: paperSize,
    });
  };

  return (
    <div>
      {/* ตัวเลือกขนาดกระดาษ */}
      <div>
        <button onClick={() => setPaperSize("58mm")}>58mm</button>
        <button onClick={() => setPaperSize("80mm")}>80mm</button>
        <button onClick={() => setPaperSize("A5")}>A5</button>
      </div>

      {/* ตัวอย่างใบเสร็จ */}
      <div
        ref={receiptRef}
        className={` ${paperSize === "58mm" ? "w-[58mm] text-[9px]" : ""} ${paperSize === "80mm" ? "w-[80mm] text-[11px]" : ""} ${paperSize === "A5" ? "w-[148mm] text-[11px]" : ""} bg-white text-black`}
      >
        <div className="text-center font-bold">ร้านค้าของเรา</div>
        <div className="text-center text-sm">123 ถนนสุขุมวิท</div>
        <div className="my-2 border-t border-dashed"></div>

        <div className="flex justify-between">
          <span>สินค้า A x2</span>
          <span>20.00</span>
        </div>

        <div className="my-2 border-t border-solid"></div>

        <div className="flex justify-between font-bold">
          <span>รวมทั้งสิ้น</span>
          <span>20.00 บาท</span>
        </div>
      </div>

      <button onClick={handlePrint}>พิมพ์</button>
    </div>
  );
}
```

### ตัวอย่าง Component ใบเสร็จแบบละเอียด

```tsx
interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptProps {
  shopName: string;
  shopAddress: string;
  taxId: string;
  receiptNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  total: number;
  paperSize: "58mm" | "80mm" | "A5";
}

export function ThermalReceipt({
  shopName,
  shopAddress,
  taxId,
  receiptNumber,
  items,
  subtotal,
  discount,
  total,
  paperSize,
}: ReceiptProps) {
  const widthClass = {
    "58mm": "w-[58mm]",
    "80mm": "w-[80mm]",
    A5: "w-[148mm]",
  }[paperSize];

  const fontClass = {
    "58mm": "text-[9px]",
    "80mm": "text-[11px]",
    A5: "text-[11px]",
  }[paperSize];

  const padding = {
    "58mm": "p-[2mm]",
    "80mm": "p-[3mm]",
    A5: "p-[8mm]",
  }[paperSize];

  return (
    <div
      className={`${widthClass} ${fontClass} ${padding} bg-white text-black`}
    >
      {/* Header */}
      <div className="space-y-1 text-center">
        <div className="text-base font-bold">{shopName}</div>
        <div className="break-words whitespace-pre-wrap">{shopAddress}</div>
        <div>เลขประจำตัวผู้เสียภาษี: {taxId}</div>
      </div>

      <div className="my-2 border-t-2 border-black"></div>

      {/* Receipt Info */}
      <div className="space-y-1">
        <div>เลขที่: {receiptNumber}</div>
        <div>วันที่: {new Date().toLocaleString("th-TH")}</div>
      </div>

      <div className="my-2 border-t border-dashed"></div>

      {/* Items */}
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={idx}>
            <div>
              {idx + 1}. {item.name}
            </div>
            <div className="flex justify-between pl-4">
              <span>
                {item.price.toFixed(2)} x {item.quantity}
              </span>
              <span>{(item.price * item.quantity).toFixed(2)} บาท</span>
            </div>
          </div>
        ))}
      </div>

      <div className="my-2 border-t border-dashed"></div>

      {/* Summary */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>รวมเป็นเงิน</span>
          <span>{subtotal.toFixed(2)} บาท</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>ส่วนลด</span>
            <span>-{discount.toFixed(2)} บาท</span>
          </div>
        )}
      </div>

      <div className="my-2 border-t-2 border-black"></div>

      {/* Total */}
      <div className="flex justify-between text-base font-bold">
        <span>รวมทั้งสิ้น</span>
        <span>{total.toFixed(2)} บาท</span>
      </div>

      <div className="my-2 border-t-2 border-black"></div>

      {/* Footer */}
      <div className="mt-4 text-center">*** ขอบคุณที่ใช้บริการ ***</div>
    </div>
  );
}
```

## 🎨 Tailwind CSS Classes สำหรับใบเสร็จ

### Layout

```css
.text-center         /* จัดกึ่งกลาง */
.flex                /* Flexbox */
.justify-between     /* Space between */
.space-y-1          /* ระยะห่างแนวตั้ง */
```

### Typography

```css
.text-[9px]         /* สำหรับ 58mm */
.text-[11px]        /* สำหรับ 80mm, A5 */
.font-bold          /* ตัวหนา */
.break-words        /* ขึ้นบรรทัดอัตโนมัติ */
.whitespace-pre-wrap /* รักษา whitespace */
```

### Borders

```css
.border-t           /* เส้นบน */
.border-dashed      /* เส้นประ */
.border-black       /* เส้นดำ */
.border-t-2         /* เส้นหนา */
```

### Spacing

```css
.p-[2mm]           /* Padding 2mm (สำหรับ 58mm) */
.p-[3mm]           /* Padding 3mm (สำหรับ 80mm) */
.p-[8mm]           /* Padding 8mm (สำหรับ A5) */
.my-2              /* Margin แนวตั้ง */
.pl-4              /* Padding ซ้าย */
```

### Width Lock (สำคัญ!)

```css
.w-[58mm]          /* ล็อกความกว้าง 58mm */
.w-[80mm]          /* ล็อกความกว้าง 80mm */
.w-[148mm]         /* ล็อกความกว้าง 148mm (A5) */
```

## 📱 Responsive Design

ใบเสร็จ thermal ไม่ควร responsive! ต้องล็อกขนาดตายตัว:

```tsx
// ❌ ไม่ถูกต้อง - responsive
<div className="w-full md:w-1/2">

// ✅ ถูกต้อง - ล็อกขนาด
<div className="w-[80mm]">
```

## 🔍 การทดสอบ

### ทดสอบบนหน้าจอ

```tsx
<div className="bg-gray-200 p-8">
  <div ref={receiptRef} className="w-[80mm] bg-white shadow-lg">
    {/* ใบเสร็จ */}
  </div>
</div>
```

### ทดสอบการพิมพ์

1. กด Ctrl+P (หรือ Cmd+P)
2. เลือก "Save as PDF"
3. ตรวจสอบว่าขนาดถูกต้อง
4. พิมพ์จริงด้วย thermal printer

## 🎯 Best Practices

1. **ใช้ขนาดฟอนต์ที่เหมาะสม**
   - 58mm: 9px
   - 80mm: 11px
   - A5: 11px

2. **ใช้ padding ที่เหมาะสม**
   - 58mm: 2mm (ประหยัดพื้นที่)
   - 80mm: 3mm (มาตรฐาน)
   - A5: 8mm (สบายตา)

3. **ใช้ฟอนต์ที่รองรับภาษาไทย**
   - Thonburi (macOS)
   - Leelawadee UI (Windows)
   - Noto Sans Thai (Web)

4. **ทดสอบก่อนใช้งานจริง**
   - พิมพ์ทดสอบหลายครั้ง
   - ทดสอบกับ thermal printer จริง
   - ตรวจสอบความชัดเจนของข้อความ

5. **จัดการข้อความยาว**
   ```tsx
   <div className="break-words whitespace-pre-wrap">{longText}</div>
   ```
