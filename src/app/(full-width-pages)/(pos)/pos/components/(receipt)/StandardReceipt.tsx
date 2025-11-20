"use client";
import React, { useMemo } from "react";
import { ReceiptPreviewProps } from "../../types/Receipt";
import Image from "next/image";
import { PaymentMethod, PAYMENT_METHOD_LABELS } from "../(modal)/PaymentModal";
import { Customer } from "../../types/Pos";

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
  paymentMethod,
  customer,
}: ReceiptPreviewProps & {
  paperSize: "80mm" | "58mm" | "A5";
  paymentMethod: PaymentMethod;
  customer: Customer | null;
}) => {
  const { isTaxInvoice, vatMode, withholdingTaxVatMode, applyWithholdingTax } = options;

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
      default:
        return {
          subTotalBeforeVat: total,
          vatAmount: 0,
          grandTotal: total,
        };
    }
  }, [total, vatMode]);

  const { withholdingTaxAmount } = useMemo(() => {
    if (!applyWithholdingTax || withholdingTaxPercent <= 0) {
      return { withholdingTaxAmount: 0 };
    }

    const amount = subTotalBeforeVat * (withholdingTaxPercent / 100);
    return { withholdingTaxAmount: amount };
  }, [applyWithholdingTax, withholdingTaxPercent, subTotalBeforeVat]);

  const netPayment =
    withholdingTaxVatMode === "pre-vat" ? grandTotal + withholdingTaxAmount : grandTotal - withholdingTaxAmount;

  const showCustomerInfo = receiptData.customerName && receiptData.customerName !== "ลูกค้าทั่วไป";

  const showCustomerPoints = customer && customer.memberId !== "N/A";

  return (
    <div className="flex flex-col">
      {/* ส่วนหัวใบเสร็จ */}
      <div className="text-center">
        <div className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-black p-2 text-center font-bold">
          <p>{isTaxInvoice ? "ใบกำกับภาษี / ใบเสร็จรับเงิน" : "ใบเสร็จรับเงิน / บิลเงินสด"}</p>
        </div>
        <div className="flex w-full items-center justify-center">
          <Image
            width={100}
            height={100}
            id="logoImage"
            src="https://lh3.googleusercontent.com/d/1M1tJzBRQXgfrKdvf9rZ5LjA6OjJy6WqI"
            alt="Logo"
            className="my-2 max-h-[80px] object-contain"
          />
        </div>
        <div className="flex w-full items-center justify-center">OK Mobile สาขา Center One</div>
        <div className="flex w-full items-center justify-center">โอเคโมบาย ห้างเซนเตอร์วัน ชั้น 2 ห้องเลขที่ 2019</div>
        <div className="flex w-full items-center justify-center">เลขที่ 1 แขวงถนนพญาไท เขตราชเทวี กรุงเทพฯ 10400</div>
        <div className="flex w-full items-center justify-center">
          <div className="flex items-center justify-center">
            <p>LINE: @okmobile (มี@)</p>
            <p className="flex items-center justify-center">
              <Image
                src="https://lh3.googleusercontent.com/d/1B0JOOangOudQr3Kzi58A8iSROesUnDxn"
                id="Websiteicon"
                alt="Website Icon"
                width={16}
                height={16}
                style={{ verticalAlign: "middle", margin: "0 4px" }}
              />
              https://no1.mobi
            </p>
          </div>
        </div>
        <div>โทร: 085-0088806, 02-1270010 ต่อ 1</div>
        <div>เลขที่ผู้เสียภาษี : 1440500100157</div>
      </div>

      <hr className="my-2 border-dashed border-black" />

      <section className="flex flex-col items-start justify-start">
        <p>เลขที่เอกสาร: {receiptData.receiptNumber}</p>
        {isTaxInvoice && options.showTaxInvoiceNumber && <p>เลขที่ใบกำกับภาษี: {receiptData.taxInvoiceNumber}</p>}
        <p>วันที่: {receiptData.printDate}</p>

        {/* ✅ KEY CHANGE: Show Name/Phone on ALL receipts if customer is selected */}
        {showCustomerInfo && (
          <>
            <p>ชื่อลูกค้า: {receiptData.customerName}</p>
            {receiptData.customerPhone && <p>เบอร์โทร: {receiptData.customerPhone}</p>}
          </>
        )}

        {/* ✅ KEY CHANGE: Show Tax ID, Address, Branch ONLY on Tax Invoices */}
        {isTaxInvoice && showCustomerInfo && (
          <>
            <p>
              {receiptData.customerType === "company" ? "เลขประจำตัวผู้เสียภาษี" : "เลขประจำตัวประชาชน"}:{" "}
              {receiptData.customerTaxId}
            </p>
            {options.showCustomerAddress && (
              <p className="break-words whitespace-pre-wrap">ที่อยู่: {receiptData.customerAddress}</p>
            )}
            {receiptData.customerType === "company" && options.showCustomerBranch && (
              <p>สาขา: {receiptData.customerBranch}</p>
            )}
          </>
        )}

        <p>ผู้ขายสินค้า: {issuer.name}</p>
      </section>

      <hr className="my-2 border-dashed border-black" />

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

      <hr className="my-2 border-dashed border-black" />

      {/* Calculation Section */}
      <section className="flex flex-col">
        <div className="flex justify-between">
          <span>รวมเป็นเงิน:</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>

        {options.showDiscounts && discounts.length > 0 && (
          <>
            {options.showDiscountNames
              ? discounts.map((d) => {
                  const discountValue = d.type === "percentage" ? subtotal * (d.value / 100) : d.value;
                  if (discountValue === 0) return null;
                  return (
                    <div key={d.id} className="flex justify-between">
                      <span>ส่วนลด: {d.name}</span>
                      <span>-{discountValue.toFixed(2)}</span>
                    </div>
                  );
                })
              : subtotal - total > 0 && (
                  <div className="flex justify-between">
                    <span>ส่วนลดรวม:</span>
                    <span>-{(subtotal - total).toFixed(2)}</span>
                  </div>
                )}
          </>
        )}

        {isTaxInvoice && (
          <>
            <div className="flex justify-between">
              <span>มูลค่าก่อนภาษี:</span>
              <span>{subTotalBeforeVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>ภาษีมูลค่าเพิ่ม (7%):</span>
              <span>{vatAmount.toFixed(2)}</span>
            </div>
          </>
        )}

        {applyWithholdingTax && withholdingTaxAmount > 0 && (
          <>
            <div className="flex justify-between">
              <span>ยอดก่อนหัก ณ ที่จ่าย:</span>
              <span>{grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>หัก ณ ที่จ่าย ({withholdingTaxPercent}%):</span>
              <span>{withholdingTaxAmount.toFixed(2)}</span>
            </div>
          </>
        )}

        <div className="flex justify-between font-bold">
          <span>ยอดสุทธิ:</span>
          <span>{netPayment.toFixed(2)}</span>
        </div>

        <div className="flex justify-end gap-1">
          <span>วิธีการชำระ:</span>
          <span>{PAYMENT_METHOD_LABELS[paymentMethod]}</span>
        </div>

        <div className="flex w-full justify-center">
          <span>
            {isTaxInvoice && vatMode === "included"
              ? "--VAT INCLUDED--"
              : isTaxInvoice && vatMode === "excluded"
                ? "--VAT EXCLUDED--"
                : null}
          </span>
        </div>

        {applyWithholdingTax && withholdingTaxAmount > 0 && (
          <div className="text-center">
            (กรุณาหักภาษี ณ ที่จ่าย {withholdingTaxPercent}% และโปรดส่งหนังสือรับรองที่ร้าน OK Mobile ภายใน 7 วัน)
          </div>
        )}

        <div className="text-center">(ผิดตกยกเว้น)</div>
      </section>

      {showCustomerPoints && customer && (
        <>
          <hr className="my-2 border-dashed border-black" />
          <section className="flex flex-col">
            <div className="flex justify-between">
              <span>OK MEMBERS:</span>
              <span>{customer.memberId}</span>
            </div>
            <div className="flex justify-between">
              <span>คะแนนสะสม:</span>
              <span>{customer.customerPoint?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>คะแนนที่ได้รับครั้งนี้:</span>
              {/* TODO: logic การคำนวณคะแนน */}
              <span>0 คะแนน</span>
            </div>
          </section>
        </>
      )}

      <hr className="my-2 border-dashed border-black" />

      <section className="flex w-full">
        <div className="mt-2 flex w-full items-center justify-center gap-4">
          <div className="flex-6">
            <Image
              width={100}
              height={100}
              id="qrlineoa"
              src="https://lh3.googleusercontent.com/d/1wLVNA2tyoCb08K8gAdcormnU7OiIZR_1"
              alt="qrlineoa"
              className="object-contain"
            />
          </div>
          <div className="flex-8">
            <span>LINE: @okmobile (มี@)</span>
            <br />
            <span>ขอบคุณที่ใช้บริการ OK MOBILE</span>
            <br />
            <span>พบปัญหาในสินค้าหรือบริการ</span>
            <br />
            <span>โปรดโทร.02-1270010 ต่อ 1</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StandardReceipt;
