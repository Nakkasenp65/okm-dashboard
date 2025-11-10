"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Customer } from "./CustomerModal";
import { FaPrint, FaUserPlus } from "react-icons/fa6";
import TaxInvoice, { ReceiptPreviewProps } from "../(receipt)/TaxInvoice";
import Receipt from "../(receipt)/Receipt";
import BookStoreInvoice from "../(receipt)/BookStoreInvoice";
import { SelectedItem } from "../../page";

export interface StaffMember {
  id: number;
  name: string;
}

export const MOCK_SHOP_INFO = {
  companyName: "บริษัท โอเคโมบาย จำกัด",
  formalName: "ศูนย์หนังสือพระจอมเกล้าธนบุรี",
  formalAddressLine1: "126 ถ.ประชาอุทิศ แขวงบางมด เขตทุ่งครุ",
  formalAddressLine2: "กรุงเทพมหานคร 10140",
  formalPhone: "โทร. 0-2470-8222, 0-2470-8224",
  logoUrl:
    "https://lh3.googleusercontent.com/d/1_placeholder_logo_url_for_kmutt_bookstore",
  companyNameEn: "OK MOBILE LTD.",
  address: "1 Ratchawithi Rd, Thanon Phaya Thai, Ratchathewi, Bangkok 10400",
  phone: "02-329-5555",
  fax: "02-727-7777",
  taxId: "0115544990123",
  branch: "สาขาที่ออกใบกำกับภาษี สำนักงานใหญ่",
};

export interface ReceiptData {
  shopName: string;
  shopAddress: string;
  shopTaxId: string;
  shopBranch: string;
  receiptNumber: string;
  customerName: string;
  customerTaxId: string;
  customerAddress: string;
  customerBranch: string;
  bookNumber: string;
}

export interface PrintOptions {
  showDiscounts: boolean;
  applyWithholdingTax: boolean;
}

const PAPER_SIZES_CSS = {
  "80mm": "w-[302px]",
  "58mm": "w-[219px]",
  A5: "w-[559px] h-[794px]",
};

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomerSearch: () => void;
  items: SelectedItem[];
  customer: Customer | null;
  subtotal: number;
  total: number;
  billIssuers: StaffMember[];
  currentIssuer: StaffMember;
}

export default function SummaryModal({
  isOpen,
  onClose,
  onOpenCustomerSearch,
  items,
  customer,
  subtotal,
  total,
  billIssuers,
  currentIssuer,
}: SummaryModalProps) {
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    shopName: MOCK_SHOP_INFO.companyName,
    shopAddress: MOCK_SHOP_INFO.address,
    shopTaxId: MOCK_SHOP_INFO.taxId,
    shopBranch: MOCK_SHOP_INFO.branch,
    receiptNumber: `IV${new Date().getFullYear().toString().slice(2)}/01-00001`,
    customerName: "ลูกค้าทั่วไป",
    customerTaxId: "",
    customerAddress: "",
    customerBranch: "สำนักงานใหญ่",
    bookNumber: "116",
  });

  const [selectedIssuerId, setSelectedIssuerId] = useState<number>(
    currentIssuer.id,
  );
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    showDiscounts: true,
    applyWithholdingTax: false,
  });
  const [withholdingTax, setWithholdingTax] = useState<number>(3);
  const [receiptType, setReceiptType] = useState<
    "taxInvoice" | "simpleReceipt80mm" | "bookstoreInvoice"
  >("taxInvoice");
  const [paperSize, setPaperSize] = useState<"80mm" | "58mm" | "A5">("A5");

  const receiptPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const randomReceiptNum = Math.floor(Math.random() * 99999)
        .toString()
        .padStart(5, "0");
      setReceiptData({
        shopName: MOCK_SHOP_INFO.companyName,
        shopAddress: MOCK_SHOP_INFO.address,
        shopTaxId: MOCK_SHOP_INFO.taxId,
        shopBranch: MOCK_SHOP_INFO.branch,
        receiptNumber: `IV${new Date().getFullYear().toString().slice(2)}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${randomReceiptNum}`,
        customerName: customer?.name || "ลูกค้าทั่วไป",
        customerTaxId: customer?.taxId || "",
        customerAddress: customer?.address || "",
        customerBranch: customer?.branch || "สำนักงานใหญ่",
        bookNumber: "116",
      });
      setSelectedIssuerId(currentIssuer.id);
      setPrintOptions({ showDiscounts: true, applyWithholdingTax: false });
      setWithholdingTax(3);
      setReceiptType("taxInvoice");
      setPaperSize("A5");
    }
  }, [isOpen, customer, currentIssuer]);

  const handleDataChange = (field: keyof ReceiptData, value: string) => {
    setReceiptData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    alert("ฟังก์ชันพิมพ์ยังเป็นตัวอย่างการทำงาน");
    console.log("Printing receipt with data:", {
      receiptData,
      printOptions,
      receiptType,
      paperSize,
    });
  };

  const selectedIssuer =
    billIssuers.find((s) => s.id === selectedIssuerId) || currentIssuer;

  const receiptProps: ReceiptPreviewProps = {
    receiptData,
    items,
    subtotal,
    total,
    issuer: selectedIssuer,
    options: printOptions,
    withholdingTaxPercent: withholdingTax,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isFullscreen={true}>
      <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-1/3 flex-shrink-0 space-y-6 overflow-y-auto bg-white p-6 dark:bg-gray-800">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            พิมพ์ใบสรุปยอด
          </h3>

          <div className="space-y-4 rounded-lg border p-4 dark:border-gray-700">
            <h4 className="text-lg font-semibold">รูปแบบเอกสาร</h4>
            <div>
              <label className="mb-2 block text-sm font-medium">ประเภท</label>
              <div className="flex">
                <SegmentedControlButton
                  isActive={receiptType === "taxInvoice"}
                  onClick={() => {
                    setReceiptType("taxInvoice");
                    setPaperSize("A5");
                  }}
                >
                  ใบกำกับภาษี
                </SegmentedControlButton>
                <SegmentedControlButton
                  isActive={receiptType === "simpleReceipt80mm"}
                  onClick={() => {
                    setReceiptType("simpleReceipt80mm");
                    setPaperSize("80mm");
                  }}
                >
                  ใบเสร็จ (80mm)
                </SegmentedControlButton>
                <SegmentedControlButton
                  isActive={receiptType === "bookstoreInvoice"}
                  onClick={() => {
                    setReceiptType("bookstoreInvoice");
                    setPaperSize("A5");
                  }}
                >
                  แบบฟอร์ม
                </SegmentedControlButton>
              </div>
            </div>
            {receiptType !== "bookstoreInvoice" && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  ขนาดกระดาษ
                </label>
                <div className="flex">
                  <SegmentedControlButton
                    isActive={paperSize === "80mm"}
                    onClick={() => setPaperSize("80mm")}
                  >
                    80mm
                  </SegmentedControlButton>
                  <SegmentedControlButton
                    isActive={paperSize === "58mm"}
                    onClick={() => setPaperSize("58mm")}
                  >
                    58mm
                  </SegmentedControlButton>
                </div>
              </div>
            )}
          </div>

          {receiptType === "taxInvoice" && (
            <div className="space-y-4 rounded-lg border p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">ข้อมูลผู้ซื้อ</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenCustomerSearch}
                  className="flex items-center gap-2"
                >
                  <FaUserPlus />
                  เลือกลูกค้า
                </Button>
              </div>

              <InputField
                label="ชื่อ / บริษัท"
                value={receiptData.customerName}
                onChange={(e) =>
                  handleDataChange("customerName", e.target.value)
                }
              />
              <InputField
                label="เลขประจำตัวผู้เสียภาษี"
                value={receiptData.customerTaxId}
                onChange={(e) =>
                  handleDataChange("customerTaxId", e.target.value)
                }
              />
              <InputField
                label="ที่อยู่"
                value={receiptData.customerAddress}
                onChange={(e) =>
                  handleDataChange("customerAddress", e.target.value)
                }
                isTextarea={true}
              />
              <InputField
                label="สาขา"
                value={receiptData.customerBranch}
                onChange={(e) =>
                  handleDataChange("customerBranch", e.target.value)
                }
              />
            </div>
          )}

          <div className="space-y-4 rounded-lg border p-4 dark:border-gray-700">
            <h4 className="text-lg font-semibold">ข้อมูลเอกสาร</h4>
            <InputField
              label="เลขที่เอกสาร"
              value={receiptData.receiptNumber}
              onChange={(e) =>
                handleDataChange("receiptNumber", e.target.value)
              }
            />
            {receiptType === "bookstoreInvoice" && (
              <InputField
                label="เล่มที่"
                value={receiptData.bookNumber}
                onChange={(e) => handleDataChange("bookNumber", e.target.value)}
              />
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                ผู้ออกบิล
              </label>
              <select
                value={selectedIssuerId}
                onChange={(e) => setSelectedIssuerId(Number(e.target.value))}
                className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              >
                {billIssuers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4 dark:border-gray-700">
            <h4 className="text-lg font-semibold">
              ตั้งค่าการคำนวณและการพิมพ์
            </h4>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                แสดงส่วนลดท้ายบิล
              </span>
              <input
                type="checkbox"
                checked={printOptions.showDiscounts}
                onChange={(e) =>
                  setPrintOptions((p) => ({
                    ...p,
                    showDiscounts: e.target.checked,
                  }))
                }
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
            {receiptType === "taxInvoice" && (
              <>
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    คิดภาษีหัก ณ ที่จ่าย
                  </span>
                  <input
                    type="checkbox"
                    checked={printOptions.applyWithholdingTax}
                    onChange={(e) =>
                      setPrintOptions((p) => ({
                        ...p,
                        applyWithholdingTax: e.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                {printOptions.applyWithholdingTax && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={withholdingTax}
                      onChange={(e) =>
                        setWithholdingTax(Number(e.target.value))
                      }
                      className="w-full rounded-md border-gray-300 p-2 text-right shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="font-semibold">%</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-3 pt-6">
            <Button
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-2 bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700"
            >
              <FaPrint /> พิมพ์
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full py-3 text-base font-medium"
            >
              ปิด
            </Button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-gray-200 p-6 dark:bg-black/50">
          <div
            ref={receiptPreviewRef}
            className={`bg-white p-6 font-mono text-xs leading-snug text-black shadow-lg ${PAPER_SIZES_CSS[paperSize]}`}
          >
            {(() => {
              switch (receiptType) {
                case "taxInvoice":
                  return <TaxInvoice {...receiptProps} />;
                case "simpleReceipt80mm":
                  return <Receipt {...receiptProps} />;
                case "bookstoreInvoice":
                  return <BookStoreInvoice {...receiptProps} />;
                default:
                  return null;
              }
            })()}
          </div>
        </div>
      </div>
    </Modal>
  );
}

const SegmentedControlButton = ({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-indigo-600 text-white shadow"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
    }`}
  >
    {children}
  </button>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder = "",
  isTextarea = false,
}: {
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  isTextarea?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
      {label}
    </label>
    {isTextarea ? (
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
      />
    )}
  </div>
);
