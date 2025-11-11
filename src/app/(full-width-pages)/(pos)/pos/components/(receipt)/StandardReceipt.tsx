"use client";
import React from "react";
import { MOCK_SHOP_INFO, ReceiptPreviewProps } from "./receiptTypes";

const StandardReceipt = ({
  // paperSize, // paperSize is available but not used in logic, only for styling in parent
  ...props
}: ReceiptPreviewProps & { paperSize: "80mm" | "58mm" | "A5" }) => {
  const {
    receiptData,
    items,
    subtotal,
    total, // This is the Grand Total after discounts
    issuer,
    options,
    withholdingTaxPercent,
    discounts,
  } = props;

  const { isTaxInvoice } = options;
  const vatRate = 7;

  // --- REVISED CALCULATION LOGIC ---
  // Calculations are based on 'total' which is the amount after discounts.
  const vatAmount = total - total / (1 + vatRate / 100);
  const subtotalBeforeVat = total - vatAmount;

  // Withholding tax is calculated on the pre-VAT amount.
  const withholdingTaxAmount = options.applyWithholdingTax
    ? subtotalBeforeVat * (withholdingTaxPercent / 100)
    : 0;

  // The final amount the customer actually pays.
  const netPayment = total - withholdingTaxAmount;

  const showCustomerInfo =
    receiptData.customerName && receiptData.customerName !== "ลูกค้าทั่วไป";

  return (
    <div className="flex flex-col">
      {/* --- Header (No Change) --- */}
      <div className="text-center">
        <strong className="font-bold">
          {isTaxInvoice
            ? MOCK_SHOP_INFO.companyName
            : MOCK_SHOP_INFO.formalName}
        </strong>
        <p>
          {isTaxInvoice
            ? MOCK_SHOP_INFO.address
            : `${MOCK_SHOP_INFO.formalAddressLine1} ${MOCK_SHOP_INFO.formalAddressLine2}`}
        </p>
        <p>
          {isTaxInvoice
            ? `โทร. ${MOCK_SHOP_INFO.phone}`
            : MOCK_SHOP_INFO.formalPhone}
        </p>
        <p>
          เลขประจำตัวผู้เสียภาษี {MOCK_SHOP_INFO.taxId}{" "}
          {isTaxInvoice ? `(${MOCK_SHOP_INFO.branch})` : ""}
        </p>
      </div>
      <hr className="my-1 border-black" />
      <div className="text-center">
        <strong className="font-bold">
          {isTaxInvoice
            ? "ใบกำกับภาษี / ใบเสร็จรับเงิน"
            : "ใบเสร็จรับเงิน (ฉบับย่อ)"}
        </strong>
        <p>เลขที่: {receiptData.receiptNumber}</p>
        <p>วันที่: {new Date().toLocaleDateString("th-TH")}</p>
      </div>
      <hr className="my-1 border-black" />

      {/* --- Customer Info (No Change) --- */}
      {isTaxInvoice && showCustomerInfo && (
        <div className="my-1">
          <p>ลูกค้า: {receiptData.customerName}</p>
          <p>
            {receiptData.customerType === "company"
              ? "เลขประจำตัวผู้เสียภาษี"
              : "เลขประจำตัวประชาชน"}
            : {receiptData.customerTaxId}
          </p>
          <p className="break-words whitespace-pre-wrap">
            ที่อยู่: {receiptData.customerAddress}
          </p>
          {receiptData.customerType === "company" &&
            options.showCustomerBranch && (
              <p>สาขา: {receiptData.customerBranch}</p>
            )}
          <hr className="my-1 border-black" />
        </div>
      )}

      {/* --- Items Table (No Change) --- */}
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left font-bold">รายการ</th>
            <th className="text-right font-bold">จำนวน</th>
            <th className="text-right font-bold">ราคา</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="pr-1">{item.name}</td>
              <td className="px-1 text-right">{item.quantity}</td>
              <td className="px-1 text-right">{item.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="my-1 border-dashed border-black" />

      {/* --- MODIFICATION START: REORDERED AND RECALCULATED SUMMARY --- */}
      <div className="space-y-1">
        {/* 1. Subtotal (Sum of all items before discount) */}
        <div className="flex justify-between">
          <span>รวมเป็นเงิน</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>

        {/* 2. Discounts (if any) */}
        {options.showDiscounts && subtotal - total > 0 && (
          <>
            {options.showDiscountNames ? (
              discounts.map((d) => {
                const discountValue =
                  d.type === "percentage"
                    ? subtotal * (d.value / 100)
                    : d.value;
                return (
                  <div key={d.id} className="flex justify-between">
                    <span>ส่วนลด: {d.name}</span>
                    <span>-{discountValue.toFixed(2)}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-between">
                <span>ส่วนลดรวม</span>
                <span>-{(subtotal - total).toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        {/* 3. Tax Invoice Details (Subtotal before VAT and VAT amount) */}
        {isTaxInvoice && (
          <>
            <div className="flex justify-between">
              <span>มูลค่าก่อนภาษี</span>
              <span>{subtotalBeforeVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>ภาษีมูลค่าเพิ่ม {vatRate}%</span>
              <span>{vatAmount.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* 4. Grand Total (This is the official invoice amount) */}
        <div className="flex justify-between font-bold">
          <span className="font-bold">ยอดรวมทั้งสิ้น</span>
          <span className="font-bold">{total.toFixed(2)}</span>
        </div>

        {/* 5. Withholding Tax (Shown for informational purposes, does not affect Grand Total) */}
        {options.applyWithholdingTax && (
          <>
            <div className="flex justify-between">
              <span>ภาษีหัก ณ ที่จ่าย {withholdingTaxPercent}%</span>
              {/* No negative sign here */}
              <span>{withholdingTaxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="font-bold">ยอดชำระสุทธิ</span>
              <span className="font-bold">{netPayment.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
      {/* --- MODIFICATION END --- */}

      <div className="mt-4 text-center">
        <p>ผู้ออก: {issuer.name}</p>
        <p className="pt-2">ขอบคุณที่ใช้บริการ</p>
      </div>
    </div>
  );
};

export default StandardReceipt;
