"use client";
import React from "react";
import { MOCK_SHOP_INFO, ReceiptPreviewProps } from "./receiptTypes";

const BookStoreInvoice = (props: ReceiptPreviewProps) => {
  const { receiptData, items, subtotal, total, issuer, discounts, options } =
    props;
  const totalDiscount = subtotal - total;

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

            <div className="flex justify-between border-t border-black pt-1 font-bold">
              <span className="font-bold">ยอดสุทธิ</span>
              <span className="font-bold">{total.toFixed(2)}</span>
            </div>
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
