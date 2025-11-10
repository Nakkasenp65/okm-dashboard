"use client";
import React from "react";
import { ReceiptPreviewProps } from "./TaxInvoice"; // Import the shared interface
import { MOCK_SHOP_INFO } from "../(modal)/SummaryModal";

export default function BookStoreInvoice({
  receiptData,
  items,
  total,
  issuer,
}: ReceiptPreviewProps) {
  const tableRows = 12;
  const emptyRows = Math.max(0, tableRows - items.length);

  const numberToThaiWords = (num: number): string => {
    return `(${num.toFixed(2)} บาท)`;
  };

  return (
    <div className="font-['Sarabun',_sans-serif] text-sm text-black">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold">{MOCK_SHOP_INFO.formalName}</p>
            <p>{MOCK_SHOP_INFO.formalAddressLine1}</p>
            <p>{MOCK_SHOP_INFO.formalAddressLine2}</p>
            <p>{MOCK_SHOP_INFO.formalPhone}</p>
          </div>
        </div>
        <div className="flex-shrink-0 border border-black p-2 text-center">
          <h2 className="font-bold">ใบเสร็จรับเงิน/RECEIPT</h2>
          <div className="mt-2 grid grid-cols-2 gap-x-4">
            <span>เล่มที่:</span>
            <span>{receiptData.bookNumber}</span>
            <span>เลขที่:</span>
            <span>{receiptData.receiptNumber}</span>
            <span>วันที่:</span>
            <span>{new Date().toLocaleDateString("th-TH")}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center">
        <span>ได้รับเงินจาก</span>
        <span className="ml-2 flex-grow border-b border-dotted border-black text-center font-semibold">
          {receiptData.customerName}
        </span>
      </div>

      <table className="mt-2 w-full border-collapse border border-black">
        <thead>
          <tr className="text-center">
            <th className="w-[5%] border border-black p-1">ลำดับ</th>
            <th className="w-[55%] border border-black p-1">รายการ</th>
            <th className="w-[10%] border border-black p-1">จำนวน</th>
            <th className="w-[15%] border border-black p-1">ราคา/หน่วย</th>
            <th className="w-[15%] border border-black p-1">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-black p-1 text-center">
                {index + 1}
              </td>
              <td className="border border-black p-1">{item.name}</td>
              <td className="border border-black p-1 text-center">
                {item.qty}
              </td>
              <td className="border border-black p-1 text-right">
                {item.unitPrice.toFixed(2)}
              </td>
              <td className="border border-black p-1 text-right">
                {(item.unitPrice * item.qty).toFixed(2)}
              </td>
            </tr>
          ))}
          {Array.from({ length: emptyRows }).map((_, index) => (
            <tr key={`empty-${index}`}>
              <td className="border border-black p-1">&nbsp;</td>
              <td className="border border-black p-1">&nbsp;</td>
              <td className="border border-black p-1">&nbsp;</td>
              <td className="border border-black p-1">&nbsp;</td>
              <td className="border border-black p-1">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 flex justify-between">
        <div className="flex w-2/3 flex-col justify-between">
          <div>
            <span>(ตัวอักษร)</span>
            <span className="ml-2 border-b border-dotted border-black">
              {numberToThaiWords(total)}
            </span>
          </div>
          <div className="mt-8 text-center">
            <p>.........................................</p>
            <p>({issuer.name})</p>
            <p>ผู้รับเงิน</p>
          </div>
        </div>
        <div className="flex w-1/3 flex-col">
          <div className="flex justify-between border-b border-black">
            <span>รวมเงิน</span>
            <span>{total.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-center text-xs">(ประทับตรา)</div>
        </div>
      </div>
    </div>
  );
}
