"use client";
import React, { useMemo } from "react";
import { MOCK_SHOP_INFO, ReceiptPreviewProps } from "../../types/Receipt";
// ✅ KEY CHANGE: Import PaymentMethod and its labels
import { PaymentMethod, PAYMENT_METHOD_LABELS } from "../(modal)/PaymentModal";

const VAT_RATE = 0.07; // 7%

// Helper function to convert number to Thai Baht text
function toThaiBahtText(num: number): string {
  const numbers = [
      "ศูนย์",
      "หนึ่ง",
      "สอง",
      "สาม",
      "สี่",
      "ห้า",
      "หก",
      "เจ็ด",
      "แปด",
      "เก้า",
    ],
    units = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"],
    parts = num.toFixed(2).split("."),
    integerPart = parts[0];
  let decimalPart = parts[1];

  if (parseInt(integerPart) === 0) return "ศูนย์บาทถ้วน";

  let result = "";
  for (let i = 0; i < integerPart.length; i++) {
    const digit = parseInt(integerPart[i]);
    const position = integerPart.length - 1 - i;
    if (digit > 0) {
      if (position === 1 && digit === 2) result += "ยี่";
      else if (position === 1 && digit === 1) result += "";
      else if (position === 0 && digit === 1 && integerPart.length > 1)
        result += "เอ็ด";
      else result += numbers[digit];
      result += units[position % 6];
      if (position >= 6 && i < integerPart.length - 1) result += units[6];
    }
  }

  result += "บาท";

  if (parseInt(decimalPart) > 0) {
    let decimalResult = "";
    if (decimalPart.length === 1) decimalPart += "0"; // Ensure two digits
    if (decimalPart[0] === "2") decimalResult += "ยี่";
    else if (decimalPart[0] !== "0" && decimalPart[0] !== "1")
      decimalResult += numbers[parseInt(decimalPart[0])];
    if (decimalPart[0] !== "0") decimalResult += "สิบ";
    if (decimalPart[1] === "1" && decimalPart[0] !== "0")
      decimalResult += "เอ็ด";
    else if (decimalPart[1] !== "0")
      decimalResult += numbers[parseInt(decimalPart[1])];
    decimalResult += "สตางค์";
    result += decimalResult;
  } else {
    result += "ถ้วน";
  }

  return result;
}

// ✅ KEY CHANGE: Add paymentMethod to props
const FormInvoice = (
  props: ReceiptPreviewProps & { paymentMethod: PaymentMethod },
) => {
  const {
    receiptData,
    items,
    subtotal,
    total,
    issuer,
    discounts,
    options,
    withholdingTaxPercent,
    paymentMethod,
  } = props;
  const totalDiscount = subtotal - total;
  const { vatMode, applyWithholdingTax, withholdingTaxVatMode } = options;

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

  const withholdingTaxBase = useMemo(() => {
    if (!applyWithholdingTax) return 0;
    if (withholdingTaxVatMode === "post-vat") {
      return grandTotal;
    } else {
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

  const netPayment = grandTotal - withholdingTaxAmount;

  return (
    <div className="flex h-full flex-col border border-black bg-white p-4 text-black">
      <header className="flex items-start justify-between border-b-2 border-black pb-2">
        <div>
          <h1 className="text-lg font-bold">{MOCK_SHOP_INFO.formalName}</h1>
          <p>{MOCK_SHOP_INFO.formalAddressLine1}</p>
          <p>{MOCK_SHOP_INFO.formalAddressLine2}</p>
          <p>{MOCK_SHOP_INFO.formalPhone}</p>
          <p>เลขประจำตัวผู้เสียภาษี: {MOCK_SHOP_INFO.taxId}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <h2 className="text-xl font-bold">ใบส่งของ/ใบแจ้งหนี้</h2>
          <p>เล่มที่: {receiptData.bookNumber}</p>
          <p>เลขที่: {receiptData.receiptNumber}</p>
          <p>วันที่: {new Date().toLocaleDateString("th-TH")}</p>
        </div>
      </header>

      {/* ✅ KEY CHANGE: Updated Customer Info Block Style */}
      <section className="my-4 rounded-md border border-black p-2">
        <p>
          <span className="font-semibold">ลูกค้า:</span>{" "}
          {receiptData.customerName}
        </p>
        <p>
          <span className="font-semibold">
            {receiptData.customerType === "company"
              ? "เลขประจำตัวผู้เสียภาษี"
              : "เลขประจำตัวประชาชน"}
            :
          </span>{" "}
          {receiptData.customerTaxId || "-"}
        </p>
        <p className="break-words whitespace-pre-wrap">
          <span className="font-semibold">ที่อยู่:</span>{" "}
          {receiptData.customerAddress || "-"}
        </p>
        {receiptData.customerType === "company" &&
          options.showCustomerBranch && (
            <p>
              <span className="font-semibold">สาขา:</span>{" "}
              {receiptData.customerBranch}
            </p>
          )}
      </section>

      <main className="flex-grow">
        <table className="w-full">
          <thead className="border-t-2 border-b-2 border-black">
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
                <td className="p-1 text-center">{index + 1}</td>
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
      </main>

      <footer className="pt-2">
        <div className="flex justify-between">
          {/* ✅ KEY CHANGE: Add Thai Baht Text */}
          <div className="w-1/2 pt-2">
            <p className="rounded-md bg-gray-100 p-2 text-center font-bold">
              ({toThaiBahtText(grandTotal)})
            </p>
          </div>
          <div className="w-1/2 space-y-1 pl-4">
            <div className="flex justify-between">
              <span>รวมเป็นเงิน</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>

            {options.showDiscounts && totalDiscount > 0 && (
              <>
                {options.showDiscountNames ? (
                  discounts.map((d) => {
                    if (d.value === 0) return null;
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
              <span>ยอดรวมทั้งสิ้น</span>
              <span>{grandTotal.toFixed(2)}</span>
            </div>

            {options.applyWithholdingTax && withholdingTaxAmount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span>ภาษีหัก ณ ที่จ่าย {withholdingTaxPercent}%</span>
                  <span>({withholdingTaxAmount.toFixed(2)})</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>ยอดชำระสุทธิ</span>
                  <span>{netPayment.toFixed(2)}</span>
                </div>
              </>
            )}

            {/* ✅ KEY CHANGE: Add Payment Method Display */}
            <div className="flex justify-between pt-1">
              <span>ชำระโดย:</span>
              <span>{PAYMENT_METHOD_LABELS[paymentMethod]}</span>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-between">
          <div className="w-1/3 text-center">
            <p className="pt-8">.................................</p>
            <p>(ผู้รับของ)</p>
            <p>วันที่: ...../...../.....</p>
          </div>
          <div className="w-1/3 text-center">
            {/* This space can be used for another signature if needed */}
          </div>
          <div className="w-1/3 text-center">
            <p className="pt-8">.................................</p>
            <p>({issuer.name})</p>
            <p>ผู้ส่งของ/ผู้รับเงิน</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FormInvoice;
