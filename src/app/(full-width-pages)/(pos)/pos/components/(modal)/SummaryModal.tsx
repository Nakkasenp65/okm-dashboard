"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Customer } from "./CustomerModal";
import { FaPrint, FaUserPlus } from "react-icons/fa6";
import { SelectedItem } from "../../page";
import SegmentedControlButton from "../(receipt)/SegmentedControlButton";
import InputField from "../(receipt)/InputField";
import { Discount } from "./DiscountModal";
import {
  StaffMember,
  ReceiptData,
  PrintOptions,
  ReceiptPreviewProps,
  MOCK_SHOP_INFO,
} from "../(receipt)/receiptTypes";
import StandardReceipt from "../(receipt)/StandardReceipt";
import BookStoreInvoice from "../(receipt)/BookStoreInvoice";
import { printReceiptToPDF } from "../../utils/printUtils";
import ConfirmationModal from "./ConfirmationModal";
import { useConfirmation } from "../../hooks/useConfirmation";

const PAPER_SIZES_CSS = {
  "80mm": "w-[302px] text-xs",
  "58mm": "w-[219px] text-[10px] leading-tight",
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
  discounts: Discount[];
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
  discounts,
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
    customerType: "individual",
    bookNumber: "116",
  });

  const [selectedIssuerId, setSelectedIssuerId] = useState<number>(
    currentIssuer.id,
  );
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    showDiscounts: true,
    showDiscountNames: true,
    applyWithholdingTax: false,
    isTaxInvoice: true,
    showCustomerBranch: true,
  });
  const [withholdingTax, setWithholdingTax] = useState<number>(3);
  const [receiptType, setReceiptType] = useState<
    "receipt" | "bookstoreInvoice"
  >("receipt");
  const [paperSize, setPaperSize] = useState<"80mm" | "58mm" | "A5">("80mm");

  const receiptPreviewRef = useRef<HTMLDivElement>(null);

  const confirmation = useConfirmation();

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
        receiptNumber: `IV${new Date().getFullYear().toString().slice(2)}/${(
          new Date().getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${randomReceiptNum}`,
        customerName: customer?.name || "ลูกค้าทั่วไป",
        customerTaxId: customer?.taxId || "",
        customerAddress: customer?.address || "",
        customerBranch: customer?.branch || "สำนักงานใหญ่",
        customerType: "individual",
        bookNumber: "116",
      });
      setSelectedIssuerId(currentIssuer.id);
      setPrintOptions({
        showDiscounts: true,
        showDiscountNames: true,
        applyWithholdingTax: false,
        isTaxInvoice: true,
        showCustomerBranch: true,
      });
      setWithholdingTax(3);
      setReceiptType("receipt");
      setPaperSize("80mm");
    }
  }, [isOpen, customer, currentIssuer]);

  const handleDataChange = (field: keyof ReceiptData, value: string) => {
    setReceiptData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrint = async () => {
    if (!receiptPreviewRef.current) {
      confirmation.showConfirmation({
        title: "ไม่สามารถพิมพ์ได้",
        message: "ไม่สามารถพิมพ์ใบเสร็จได้ กรุณาลองใหม่อีกครั้ง",
        type: "error",
        confirmText: "ตกลง",
        showCancel: false,
      });
      return;
    }

    try {
      const filename = `receipt-${receiptData.receiptNumber.replace(/\//g, "-")}.pdf`;
      await printReceiptToPDF(receiptPreviewRef.current, filename, {
        pageSize: paperSize,
      });
    } catch (error) {
      console.error("Error printing receipt:", error);
      confirmation.showConfirmation({
        title: "เกิดข้อผิดพลาด",
        message: `เกิดข้อผิดพลาดในการพิมพ์: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
        confirmText: "ตกลง",
        showCancel: false,
      });
    }
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
    discounts: discounts,
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isFullscreen={true}>
        <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900">
          <div className="w-1/3 flex-shrink-0 space-y-6 overflow-y-auto bg-white p-6 dark:bg-gray-800">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              พิมพ์ใบสรุปยอด
            </h3>

            {/* Document Type and Paper Size */}
            <div className="space-y-4 rounded-lg border p-4 dark:border-gray-700">
              <h4 className="text-lg font-semibold">รูปแบบเอกสาร</h4>
              <div>
                <label className="mb-2 block text-sm font-medium">ประเภท</label>
                <div className="flex gap-2">
                  <SegmentedControlButton
                    isActive={receiptType === "receipt"}
                    onClick={() => {
                      setReceiptType("receipt");
                      setPaperSize("80mm");
                    }}
                  >
                    ใบเสร็จ
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
              {receiptType === "receipt" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    ขนาดกระดาษ
                  </label>
                  <div className="flex gap-2">
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
                    <SegmentedControlButton
                      isActive={paperSize === "A5"}
                      onClick={() => setPaperSize("A5")}
                    >
                      A5
                    </SegmentedControlButton>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Info Section */}
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

              {/* --- NEW: CUSTOMER TYPE SELECTOR --- */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  ประเภทลูกค้า
                </label>
                <div className="flex gap-2">
                  <SegmentedControlButton
                    isActive={receiptData.customerType === "individual"}
                    onClick={() =>
                      handleDataChange("customerType", "individual")
                    }
                  >
                    บุคคลธรรมดา
                  </SegmentedControlButton>
                  <SegmentedControlButton
                    isActive={receiptData.customerType === "company"}
                    onClick={() => handleDataChange("customerType", "company")}
                  >
                    นิติบุคคล
                  </SegmentedControlButton>
                </div>
              </div>

              <InputField
                label="ชื่อ / บริษัท"
                value={receiptData.customerName}
                onChange={(e) =>
                  handleDataChange("customerName", e.target.value)
                }
              />
              <InputField
                label={
                  receiptData.customerType === "company"
                    ? "เลขประจำตัวผู้เสียภาษี"
                    : "เลขประจำตัวประชาชน / ผู้เสียภาษี"
                }
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
              {/* --- CONDITIONAL BRANCH FIELD --- */}
              {receiptData.customerType === "company" && (
                <InputField
                  label="สาขา"
                  value={receiptData.customerBranch}
                  onChange={(e) =>
                    handleDataChange("customerBranch", e.target.value)
                  }
                />
              )}
            </div>

            {/* Document Info Section */}
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
                  onChange={(e) =>
                    handleDataChange("bookNumber", e.target.value)
                  }
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

            {/* Print Settings Section */}
            <div className="space-y-4 rounded-lg border p-4 dark:border-gray-700">
              <h4 className="text-lg font-semibold">
                ตั้งค่าการคำนวณและการพิมพ์
              </h4>
              {receiptType === "receipt" && (
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    พิมพ์เป็นใบกำกับภาษี
                  </span>
                  <input
                    type="checkbox"
                    checked={printOptions.isTaxInvoice}
                    onChange={(e) =>
                      setPrintOptions((p) => ({
                        ...p,
                        isTaxInvoice: e.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              )}
              {/* --- NEW: CONDITIONAL BRANCH VISIBILITY CHECKBOX --- */}
              {printOptions.isTaxInvoice &&
                receiptData.customerType === "company" && (
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      แสดงข้อมูลสาขาของผู้ซื้อ
                    </span>
                    <input
                      type="checkbox"
                      checked={printOptions.showCustomerBranch}
                      onChange={(e) =>
                        setPrintOptions((p) => ({
                          ...p,
                          showCustomerBranch: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                )}
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
              {printOptions.showDiscounts && (
                <label className="flex cursor-pointer items-center justify-between pl-4">
                  <span className="text-gray-700 dark:text-gray-300">
                    แสดงรายละเอียดส่วนลด
                  </span>
                  <input
                    type="checkbox"
                    checked={printOptions.showDiscountNames}
                    onChange={(e) =>
                      setPrintOptions((p) => ({
                        ...p,
                        showDiscountNames: e.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              )}
              {printOptions.isTaxInvoice && (
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

          {/* Receipt Preview */}
          <div className="flex flex-1 items-center justify-center bg-gray-200 p-6 dark:bg-black/50">
            <div
              ref={receiptPreviewRef}
              className={`overflow-hidden bg-white p-4 font-mono text-black shadow-lg ${
                PAPER_SIZES_CSS[paperSize]
              }`}
            >
              {(() => {
                switch (receiptType) {
                  case "receipt":
                    return (
                      <StandardReceipt
                        {...receiptProps}
                        paperSize={paperSize}
                      />
                    );
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

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.hideConfirmation}
        onConfirm={confirmation.config.onConfirm}
        title={confirmation.config.title}
        message={confirmation.config.message}
        type={confirmation.config.type}
        confirmText={confirmation.config.confirmText}
        cancelText={confirmation.config.cancelText}
        showCancel={confirmation.config.showCancel}
      />
    </>
  );
}
