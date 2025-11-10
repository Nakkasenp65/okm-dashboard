"use client";
import React from "react";
import { ReceiptPreviewProps } from "./TaxInvoice"; // Import the shared interface
import { MOCK_SHOP_INFO } from "../(modal)/SummaryModal";

export default function Receipt({
  receiptData,
  items,
  subtotal,
  total,
  issuer,
  options,
}: ReceiptPreviewProps) {
  const totalDiscountAmount = subtotal - total;

  return (
    <>
      <div className="text-center">
        <p className="font-bold">{receiptData.shopName}</p>
        <p className="text-[9px]">{receiptData.shopAddress}</p>
        <p className="text-[9px]">โทร: {MOCK_SHOP_INFO.phone}</p>
        <p className="text-[9px]">
          เลขประจำตัวผู้เสียภาษี: {receiptData.shopTaxId}
        </p>
      </div>
      <p className="my-1 border-y border-dashed border-black text-center text-[9px]">
        ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ
      </p>
      <div>
        <div className="flex justify-between">
          <span>RECEIPT#</span>
          <span>{receiptData.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>DATE</span>
          <span>{new Date().toLocaleDateString("en-GB")}</span>
        </div>
        <div className="flex justify-between">
          <span>TIME</span>
          <span>{new Date().toLocaleTimeString("th-TH")}</span>
        </div>
        <div className="flex justify-between">
          <span>CASHIER</span>
          <span>{issuer.name}</span>
        </div>
      </div>
      <div className="my-1 border-t border-dashed border-black">
        <div className="flex font-bold">
          <span className="w-1/12">#</span>
          <span className="w-6/12">รายการ</span>
          <span className="w-2/12 text-center">จำนวน</span>
          <span className="w-3/12 text-right">รวม</span>
        </div>
        <div className="border-b border-dashed border-black pb-1">
          {items.map((item, index) => (
            <div key={item.id} className="flex">
              <span className="w-1/12">{index + 1}</span>
              <span className="w-6/12 truncate">{item.name}</span>
              <span className="w-2/12 text-center">{item.qty}</span>
              <span className="w-3/12 text-right">
                {(item.unitPrice * item.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        {options.showDiscounts && totalDiscountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>- {totalDiscountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL</span>
          <span>{total.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-2 border-t border-dashed border-black pt-2 text-center">
        <p className="font-bold">THANK YOU</p>
        <p className="text-[9px]">POS System by Chiron Inc.</p>
      </div>
    </>
  );
}
