"use client";
import React from "react";
import { SelectedItem } from "../../page";
import {
  StaffMember,
  ReceiptData,
  PrintOptions,
  MOCK_SHOP_INFO,
} from "../(modal)/SummaryModal";

// This interface should be defined in a shared file for reusability
export interface ReceiptPreviewProps {
  receiptData: ReceiptData;
  items: SelectedItem[];
  subtotal: number;
  total: number;
  issuer: StaffMember;
  options: PrintOptions;
  withholdingTaxPercent: number;
}

export default function TaxInvoice({
  receiptData,
  items,
  subtotal,
  total,
  issuer,
  options,
  withholdingTaxPercent,
}: ReceiptPreviewProps) {
  const totalDiscountAmount = subtotal - total;
  const withholdingTaxAmount = options.applyWithholdingTax
    ? total * (withholdingTaxPercent / 100)
    : 0;

  return (
    <>
      <div className="text-center">
        <p className="font-bold">{receiptData.shopName}</p>
        <p>{MOCK_SHOP_INFO.companyNameEn}</p>
        <p>{receiptData.shopAddress}</p>
        <p>
          โทร: {MOCK_SHOP_INFO.phone} แฟกซ์: {MOCK_SHOP_INFO.fax}
        </p>
        <p>เลขประจำตัวผู้เสียภาษี {receiptData.shopTaxId}</p>
        <p>{receiptData.shopBranch}</p>
      </div>
      <div className="my-1 border-y border-dashed border-black py-1 text-center font-bold">
        ใบเสร็จรับเงิน / ใบกำกับภาษี
      </div>
      <div className="flex justify-between">
        <span>วันที่: {new Date().toLocaleDateString("th-TH")}</span>
        <span>เวลา: {new Date().toLocaleTimeString("th-TH")}</span>
      </div>
      <p>เลขที่ใบกำกับ: {receiptData.receiptNumber}</p>
      <div className="mt-1 border-t border-dashed border-black pt-1">
        <p>ชื่อผู้ซื้อ: {receiptData.customerName}</p>
        <p>TAX ID ผู้ซื้อ: {receiptData.customerTaxId || "-"}</p>
        <p>ที่อยู่: {receiptData.customerAddress || "-"}</p>
      </div>
      <div className="my-1 border-y border-dashed border-black">
        <div className="flex font-bold">
          <span className="w-4/5">รายการ</span>
          <span className="w-1/5 text-right">รวม</span>
        </div>
        {items.map((item) => (
          <div key={item.id} className="flex">
            <span className="w-4/5">
              {item.name} ({item.qty})
            </span>
            <span className="w-1/5 text-right">
              {(item.unitPrice * item.qty).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <span>รวมเป็นเงิน</span>
        <span>{subtotal.toFixed(2)}</span>
      </div>
      {options.showDiscounts && totalDiscountAmount > 0 && (
        <div className="flex justify-between">
          <span>ส่วนลดรวม</span>
          <span>- {totalDiscountAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>ยอดหลังหักส่วนลด</span>
        <span>{total.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>ภาษีมูลค่าเพิ่ม 7%</span>
        <span>{(total - total / 1.07).toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>มูลค่าก่อนภาษี</span>
        <span>{(total / 1.07).toFixed(2)}</span>
      </div>
      {options.applyWithholdingTax && withholdingTaxAmount > 0 && (
        <div className="flex justify-between">
          <span>หัก ณ ที่จ่าย ({withholdingTaxPercent}%)</span>
          <span>{withholdingTaxAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="mt-1 flex justify-between border-t border-dashed border-black pt-1 font-bold">
        <span>ยอดสุทธิที่ต้องชำระ</span>
        <span>{total.toFixed(2)}</span>
      </div>
      <div className="mt-1 border-t border-dashed border-black pt-1">
        <p>Cashier: {issuer.name}</p>
      </div>
      <div className="mt-2 text-center">
        <p>**Thank You Please come again**</p>
        <p>**ขอบคุณที่ใช้บริการ**</p>
      </div>
    </>
  );
}
