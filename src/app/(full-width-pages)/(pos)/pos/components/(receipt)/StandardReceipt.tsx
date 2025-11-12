"use client";
import React, { useMemo } from "react";
import { MOCK_SHOP_INFO, ReceiptPreviewProps } from "./receiptTypes";

const VAT_RATE = 0.07; // 7%

const StandardReceipt = ({
  receiptData,
  items,
  subtotal,
  total,
  issuer,
  options,
  withholdingTaxPercent,
  discounts,
}: ReceiptPreviewProps & { paperSize: "80mm" | "58mm" | "A5" }) => {
  const { isTaxInvoice, vatMode, withholdingTaxVatMode } = options;

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

  const withholdingTaxAmount =
    subTotalBeforeVat * (withholdingTaxPercent / 100);

  // ✅ KEY CHANGE: ยอดชำระสุทธิ คือ ยอดรวมทั้งสิ้น "หักออกด้วย" ภาษีหัก ณ ที่จ่าย
  const netPayment =
    withholdingTaxVatMode === "pre-vat" && options.applyWithholdingTax
      ? grandTotal + withholdingTaxAmount
      : grandTotal;

  const showCustomerInfo =
    receiptData.customerName && receiptData.customerName !== "ลูกค้าทั่วไป";

  return (
    <div className="flex flex-col">
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
            ? `โทร: ${MOCK_SHOP_INFO.phone}`
            : MOCK_SHOP_INFO.formalPhone}
        </p>
        <p>{`LINE: ${MOCK_SHOP_INFO.LINE}`}</p>
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
            : "ใบเสร็จรับเงิน / บิลเงินสด"}
        </strong>
        <p>เลขที่: {receiptData.receiptNumber}</p>
        <p>วันที่: {new Date().toLocaleDateString("th-TH")}</p>
      </div>
      <hr className="my-1 border-black" />

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

      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span>รวมเป็นเงิน</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>

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

        {isTaxInvoice && vatMode !== "off" && (
          <>
            <div className="flex justify-between">
              <span>มูลค่าก่อนภาษี</span>
              <span>{subTotalBeforeVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>ภาษีมูลค่าเพิ่ม 7%</span>
              <span>{vatAmount.toFixed(2)}</span>
            </div>
            {options.applyWithholdingTax && (
              <div className="flex justify-between">
                <span>ภาษีหัก ณ ที่จ่าย {withholdingTaxPercent}%</span>
                {/* แสดงเป็นค่ำในวงเล็บ หมายถึงการหักออก */}
                <span>{withholdingTaxAmount.toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        {/* ยอดชำระรวม ก่อนหักภาษี ณ ที่จ่าย */}
        {options.applyWithholdingTax &&
          options.withholdingTaxVatMode === "post-vat" &&
          withholdingTaxAmount > 0 && (
            <>
              <div className="flex justify-between">
                <span>ยอดชำระรวม</span>
                <span>{(grandTotal + withholdingTaxAmount).toFixed(2)}</span>
              </div>
            </>
          )}

        {/* ✅ KEY CHANGE: ปรับปรุงการแสดงผลให้ถูกต้องตามหลักบัญชี */}
        <>
          <div className="flex justify-between font-bold">
            <span>ยอดชำระสุทธิ</span>
            <span>{netPayment.toFixed(2)}</span>
          </div>
        </>
        {options.applyWithholdingTax && (
          <>
            <div className="mt-2 text-center">
              (กรุณาหักภาษี ณ ที่จ่าย 3% และโปรดส่งหนังสือรับรองที่ร้าน OK
              Mobile ภายใน 7 วัน)
            </div>
          </>
        )}
        <>
          <div className="text-center">(ผิดตกยกเว้น)</div>
        </>
      </div>

      <div className="mt-4 text-center">
        <p>ผู้ขายสินค้า: {issuer.name}</p>
        <p className="pt-2">ขอบคุณที่ใช้บริการ</p>
      </div>
    </div>
  );
};

export default StandardReceipt;
