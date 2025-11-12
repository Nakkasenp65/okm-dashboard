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
  VatCalculationMode,
} from "../(receipt)/receiptTypes";
import StandardReceipt from "../(receipt)/StandardReceipt";
import BookStoreInvoice from "../(receipt)/BookStoreInvoice";
import { printReceiptToPDF } from "../../utils/printUtils";
import ConfirmationModal from "./ConfirmationModal";
import { useConfirmation } from "../../hooks/useConfirmation";
import clsx from "clsx"; // Import clsx for conditional classes

const PAPER_SIZES_CSS = {
  "80mm": "w-[80mm] text-[11px] leading-normal",
  "58mm": "w-[58mm] text-[9px] leading-tight",
  A5: "w-[148mm] h-[210mm] text-[11px] leading-relaxed",
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
  vatMode: VatCalculationMode;
  setVatMode: (mode: VatCalculationMode) => void;
  withholdingTaxPercent: number;
  setWithholdingTaxPercent: (percent: number) => void;
  withholdingTaxVatMode: "pre-vat" | "post-vat";
  setWithholdingTaxVatMode: (mode: "pre-vat" | "post-vat") => void;
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
  vatMode,
  setVatMode,
  withholdingTaxPercent,
  setWithholdingTaxPercent,
  withholdingTaxVatMode,
  setWithholdingTaxVatMode,
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
    vatMode: "off",
    withholdingTaxVatMode: "pre-vat",
  });
  const [receiptType, setReceiptType] = useState<
    "receipt" | "bookstoreInvoice"
  >("receipt");
  const [paperSize, setPaperSize] = useState<"80mm" | "58mm" | "A5">("80mm");

  const receiptPreviewRef = useRef<HTMLDivElement>(null);
  const confirmation = useConfirmation();

  // ✅ KEY CHANGE: Enforce withholding tax for companies
  useEffect(() => {
    if (receiptData.customerType === "company") {
      // Force enable withholding tax
      setPrintOptions((p) => ({ ...p, applyWithholdingTax: true }));
      // If no percentage is set, default to 3%
      if (withholdingTaxPercent === 0) {
        setWithholdingTaxPercent(3);
      }
    }
  }, [
    receiptData.customerType,
    withholdingTaxPercent,
    setWithholdingTaxPercent,
  ]);

  useEffect(() => {
    setPrintOptions((prev) => ({ ...prev, vatMode }));
  }, [vatMode]);

  useEffect(() => {
    setPrintOptions((prev) => ({
      ...prev,
      withholdingTaxVatMode: withholdingTaxVatMode,
      applyWithholdingTax: withholdingTaxPercent > 0,
    }));
  }, [withholdingTaxVatMode, withholdingTaxPercent]);

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
        customerTaxId: customer?.citizenId || "",
        customerAddress: customer?.address || "",
        customerBranch: customer?.branch || "สำนักงานใหญ่",
        customerType: customer?.customerType || "individual", // Use customer type from customer data
        bookNumber: "116",
      });
      setSelectedIssuerId(currentIssuer.id);
      setPrintOptions({
        showDiscounts: true,
        showDiscountNames: true,
        applyWithholdingTax: withholdingTaxPercent > 0,
        isTaxInvoice: true,
        showCustomerBranch: true,
        vatMode: vatMode,
        withholdingTaxVatMode: withholdingTaxVatMode,
      });
      setReceiptType("receipt");
      setPaperSize("80mm");
    }
  }, [
    isOpen,
    customer,
    currentIssuer,
    vatMode,
    withholdingTaxPercent,
    withholdingTaxVatMode,
  ]);

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
      const filename = `receipt-${receiptData.receiptNumber.replace(
        /\//g,
        "-",
      )}.pdf`;
      await printReceiptToPDF(receiptPreviewRef.current, filename, {
        pageSize: paperSize,
      });
    } catch (error) {
      console.error("Error printing receipt:", error);
      confirmation.showConfirmation({
        title: "เกิดข้อผิดพลาด",
        message: `เกิดข้อผิดพลาดในการพิมพ์: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
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
    withholdingTaxPercent: withholdingTaxPercent,
    discounts: discounts,
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isFullscreen={true}>
        <div className="flex h-screen w-screen flex-col bg-gray-50 md:flex-row dark:bg-gray-950">
          <div className="no-scrollbar w-full flex-shrink-0 overflow-y-auto bg-white px-2 md:w-1/3 md:px-5 dark:bg-gray-900">
            <div className="-mx-2 bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-3 text-white shadow-sm md:sticky md:top-0 md:-mx-5 md:px-5 md:py-4">
              <h3 className="text-lg font-bold md:text-xl">พิมพ์ใบสรุปยอด</h3>
            </div>

            <div className="mt-3 space-y-3 md:mt-8 md:space-y-5">
              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/50 p-3 md:space-y-3 md:p-4 dark:border-gray-700/50 dark:bg-gray-800/30">
                <h4 className="text-xs font-bold tracking-wide text-gray-700 uppercase md:text-sm dark:text-gray-300">
                  รูปแบบเอกสาร
                </h4>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold tracking-wide text-gray-600 uppercase md:mb-2 md:text-xs dark:text-gray-400">
                    ประเภท
                  </label>
                  <div className="flex gap-1.5 md:gap-2">
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
                    <label className="mb-2 block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
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

              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700/50 dark:bg-gray-800/30">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                    ข้อมูลผู้ซื้อ
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenCustomerSearch}
                    className="flex items-center gap-2 text-xs"
                  >
                    <FaUserPlus size={14} />
                    เลือก
                  </Button>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
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
                      onClick={() =>
                        handleDataChange("customerType", "company")
                      }
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

              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700/50 dark:bg-gray-800/30">
                <h4 className="text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                  ข้อมูลเอกสาร
                </h4>
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
                  <label className="block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                    ผู้ขายสินค้า
                  </label>
                  <select
                    value={selectedIssuerId}
                    onChange={(e) =>
                      setSelectedIssuerId(Number(e.target.value))
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    {billIssuers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700/50 dark:bg-gray-800/30">
                <h4 className="text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                  ตั้งค่าการพิมพ์
                </h4>
                {receiptType === "receipt" && (
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                )}

                {printOptions.isTaxInvoice && (
                  <div className="space-y-2.5 rounded-lg border border-blue-200/50 bg-blue-50/30 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
                    <label className="mb-0.5 block text-xs font-bold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                      ภาษีมูลค่าเพิ่ม (VAT 7%)
                    </label>
                    <div className="flex gap-1.5">
                      <SegmentedControlButton
                        isActive={printOptions.vatMode === "off"}
                        onClick={() => setVatMode("off")}
                      >
                        ไม่คิด
                      </SegmentedControlButton>
                      <SegmentedControlButton
                        isActive={printOptions.vatMode === "included"}
                        onClick={() => setVatMode("included")}
                      >
                        รวม
                      </SegmentedControlButton>
                      <SegmentedControlButton
                        isActive={printOptions.vatMode === "excluded"}
                        onClick={() => setVatMode("excluded")}
                      >
                        แยก
                      </SegmentedControlButton>
                    </div>
                  </div>
                )}

                {printOptions.isTaxInvoice &&
                  receiptData.customerType === "company" && (
                    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  )}

                {printOptions.isTaxInvoice && (
                  <div className="space-y-2.5 rounded-lg border border-amber-200/50 bg-amber-50/30 p-3 dark:border-amber-900/30 dark:bg-amber-950/20">
                    {/* ✅ KEY CHANGE: Disable checkbox when customer is a company */}
                    <label
                      className={clsx(
                        "flex cursor-pointer items-center justify-between",
                        {
                          "cursor-not-allowed opacity-60":
                            receiptData.customerType === "company",
                        },
                      )}
                    >
                      <span className="text-sm font-bold tracking-wide text-amber-700 uppercase dark:text-amber-300">
                        ภาษีหัก ณ ที่จ่าย
                      </span>
                      <input
                        type="checkbox"
                        checked={printOptions.applyWithholdingTax}
                        disabled={receiptData.customerType === "company"}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setPrintOptions((p) => ({
                            ...p,
                            applyWithholdingTax: isChecked,
                          }));
                          if (!isChecked) {
                            setWithholdingTaxPercent(0);
                          } else if (withholdingTaxPercent === 0) {
                            setWithholdingTaxPercent(3);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    {printOptions.applyWithholdingTax && (
                      <div className="space-y-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-amber-700 dark:text-amber-300">
                            เปอร์เซ็นต์ (%)
                          </label>
                          <input
                            type="number"
                            value={withholdingTaxPercent}
                            onChange={(e) =>
                              setWithholdingTaxPercent(Number(e.target.value))
                            }
                            min="0"
                            max="100"
                            step="0.5"
                            className="w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-right text-sm dark:border-amber-700 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-amber-700 dark:text-amber-300">
                            คำนวณจาก
                          </label>
                          <div className="flex gap-1.5">
                            <SegmentedControlButton
                              isActive={
                                printOptions.withholdingTaxVatMode === "pre-vat"
                              }
                              onClick={() => {
                                setPrintOptions((p) => ({
                                  ...p,
                                  withholdingTaxVatMode: "pre-vat",
                                }));
                                setWithholdingTaxVatMode("pre-vat");
                              }}
                            >
                              ก่อน VAT
                            </SegmentedControlButton>
                            <SegmentedControlButton
                              isActive={
                                printOptions.withholdingTaxVatMode ===
                                "post-vat"
                              }
                              onClick={() => {
                                setPrintOptions((p) => ({
                                  ...p,
                                  withholdingTaxVatMode: "post-vat",
                                }));
                                setWithholdingTaxVatMode("post-vat");
                              }}
                            >
                              รวม VAT
                            </SegmentedControlButton>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                {printOptions.showDiscounts && (
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="-mx-2 -mb-2 space-y-2 border-t border-gray-200 bg-white px-2 py-3 shadow-lg md:sticky md:bottom-0 md:-mx-5 md:-mb-5 md:space-y-2.5 md:px-5 md:py-4 dark:border-gray-700 dark:bg-gray-900">
              <Button
                onClick={handlePrint}
                className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-base font-bold text-white shadow-md hover:from-blue-700 hover:to-blue-800"
              >
                <FaPrint /> พิมพ์
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full py-2.5 font-medium text-gray-700 dark:text-gray-300"
              >
                ปิด
              </Button>
            </div>
          </div>

          <div className="hidden flex-1 items-start justify-center overflow-y-auto bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 p-4 md:flex md:p-6 dark:from-black dark:via-gray-950 dark:to-black">
            <div className="flex min-h-full items-start justify-center pt-4">
              <div
                ref={receiptPreviewRef}
                className={`bg-white font-sans text-black shadow-2xl ${
                  PAPER_SIZES_CSS[paperSize]
                }`}
                style={{
                  padding:
                    paperSize === "58mm"
                      ? "2mm"
                      : paperSize === "80mm"
                        ? "3mm"
                        : "8mm",
                }}
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
