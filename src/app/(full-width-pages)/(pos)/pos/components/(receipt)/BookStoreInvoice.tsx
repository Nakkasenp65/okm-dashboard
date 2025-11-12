"use client";
import React, { useMemo } from "react";
import { MOCK_SHOP_INFO, ReceiptPreviewProps } from "./receiptTypes";

const VAT_RATE = 0.07; // 7%

const BookStoreInvoice = (props: ReceiptPreviewProps) => {
  const {
    receiptData,
    items,
    subtotal,
    total,
    issuer,
    discounts,
    options,
    withholdingTaxPercent,
  } = props;
  const totalDiscount = subtotal - total;
  const { vatMode, applyWithholdingTax, withholdingTaxVatMode } = options;

  // ✅ คำนวณ VAT ตามโหมดที่เลือก (เหมือน StandardReceipt)
  const { subTotalBeforeVat, vatAmount, grandTotal } = useMemo(() => {
    switch (vatMode) {
      case "included":
        const includedGrandTotal = total;
        const includedSubTotal = total / (1 + VAT_RATE);
        const includedVatAmount = includedGrandTotal - includedSubTotal;
        return {
          subTotalBeforeVat: includedSubTotal,
          vatAmount: includedVatAmount,
          grandTotal: includedGrandTotal,
        };
      case "excluded":
        const excludedSubTotal = total;
        const excludedVatAmount = total * VAT_RATE;
        const excludedGrandTotal = excludedSubTotal + excludedVatAmount;
        return {
          subTotalBeforeVat: excludedSubTotal,
          vatAmount: excludedVatAmount,
          grandTotal: excludedGrandTotal,
        };
      case "off":
      default:
        return {
          subTotalBeforeVat: total,
          vatAmount: 0,
          grandTotal: total,
        };
    }
  }, [total, vatMode]);

  // ✅ คำนวณภาษีหัก ณ ที่จ่าย
  // - withholdingTaxVatMode = "pre-vat": คำนวณจากยอดก่อน VAT (subTotalBeforeVat)
  // - withholdingTaxVatMode = "post-vat": คำนวณจากยอดรวมทั้งสิ้น (grandTotal)
  const withholdingTaxBase = useMemo(() => {
    if (!applyWithholdingTax) return 0;

    if (withholdingTaxVatMode === "post-vat") {
      // คำนวณจากยอดรวมทั้งสิ้น (หลัง VAT)
      return grandTotal;
    } else {
      // คำนวณจากยอดก่อน VAT (pre-vat)
      // ถ้าไม่ได้คิด VAT ให้ใช้ grandTotal
      return vatMode !== "off" ? subTotalBeforeVat : grandTotal;
    }
  }, [
    applyWithholdingTax,
    withholdingTaxVatMode,
    grandTotal,
    vatMode,
    subTotalBeforeVat,
  ]);

  const withholdingTaxAmount =
    withholdingTaxBase * (withholdingTaxPercent / 100);

  // ✅ ยอดชำระสุทธิ = ยอดรวมทั้งสิ้น - ภาษีหัก ณ ที่จ่าย
  const netPayment = grandTotal - withholdingTaxAmount;

  return (
    <div className="flex h-full flex-col border border-black p-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold">{MOCK_SHOP_INFO.formalName}</h1>
          <p>{MOCK_SHOP_INFO.formalAddressLine1}</p>
          <p>{MOCK_SHOP_INFO.formalAddressLine2}</p>
          <p>{MOCK_SHOP_INFO.formalPhone}</p>
          <p>เลขประจำตัวผู้เสียภาษี: {MOCK_SHOP_INFO.taxId}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold">ใบส่งของ/ใบแจ้งหนี้</h2>
          <p>เล่มที่: {receiptData.bookNumber}</p>
          <p>เลขที่: {receiptData.receiptNumber}</p>
          <p>วันที่: {new Date().toLocaleDateString("th-TH")}</p>
        </div>
      </div>

      {/* --- UPDATED CUSTOMER INFO BLOCK --- */}
      <div className="my-4 border-y border-black py-2">
        <p>ลูกค้า: {receiptData.customerName}</p>
        <p>
          {receiptData.customerType === "company"
            ? "เลขประจำตัวผู้เสียภาษี"
            : "เลขประจำตัวประชาชน"}
          : {receiptData.customerTaxId || "-"}
        </p>
        <p className="break-words whitespace-pre-wrap">
          ที่อยู่: {receiptData.customerAddress || "-"}
        </p>
        {receiptData.customerType === "company" &&
          options.showCustomerBranch && (
            <p>สาขา: {receiptData.customerBranch}</p>
          )}
      </div>

      <div className="flex-grow">
        <table className="w-full">
          <thead className="border-b border-black">
            <tr>
              <th className="p-1 text-left font-bold">ลำดับ</th>
              <th className="p-1 text-left font-bold">รายการ</th>
              <th className="p-1 text-right font-bold">จำนวน</th>
              <th className="p-1 text-right font-bold">หน่วยละ</th>
              <th className="p-1 text-right font-bold">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b">
                <td className="p-1">{index + 1}</td>
                <td className="p-1">{item.name}</td>
                <td className="p-1 text-right">{item.quantity}</td>
                <td className="p-1 text-right">{item.price.toFixed(2)}</td>
                <td className="p-1 text-right">
                  {(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-2">
        <div className="flex justify-end">
          <div className="w-2/3 space-y-1">
            <div className="flex justify-between">
              <span>รวมเป็นเงิน</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>

            {options.showDiscounts && totalDiscount > 0 && (
              <>
                {options.showDiscountNames ? (
                  discounts.map((d) => {
                    const discountValue =
                      d.type === "percentage"
                        ? subtotal * (d.value / 100)
                        : d.value;
                    return (
                      <div key={d.id} className="flex justify-between">
                        <span>{d.name}</span>
                        <span>-{discountValue.toFixed(2)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex justify-between">
                    <span>ส่วนลดรวม</span>
                    <span>-{totalDiscount.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            {/* ✅ แสดง VAT (ถ้ามี) */}
            {vatMode !== "off" && (
              <>
                <div className="flex justify-between">
                  <span>มูลค่าก่อนภาษี</span>
                  <span>{subTotalBeforeVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ภาษีมูลค่าเพิ่ม 7%</span>
                  <span>{vatAmount.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between border-t border-black pt-1 font-bold">
              <span className="font-bold">ยอดรวมทั้งสิ้น</span>
              <span className="font-bold">{grandTotal.toFixed(2)}</span>
            </div>

            {/* ✅ แสดงภาษีหัก ณ ที่จ่าย (ถ้ามี) */}
            {options.applyWithholdingTax && withholdingTaxAmount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span>ภาษีหัก ณ ที่จ่าย {withholdingTaxPercent}%</span>
                  <span>{withholdingTaxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="font-bold">ยอดชำระสุทธิ</span>
                  <span className="font-bold">{netPayment.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-8 flex justify-between">
          <div className="text-center">
            <p className="pt-8">.................................</p>
            <p>(ผู้รับของ)</p>
          </div>
          <div className="text-center">
            <p className="pt-8">.................................</p>
            <p>({issuer.name})</p>
            <p>ผู้ส่งของ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookStoreInvoice;
