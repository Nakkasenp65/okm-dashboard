"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { FaPrint, FaUserPlus, FaPen, FaUnlock } from "react-icons/fa";
import { SelectedItem } from "../../page";
import SegmentedControlButton from "../(receipt)/SegmentedControlButton";
import InputField from "../(receipt)/InputField";
import {
  ReceiptData,
  PrintOptions,
  ReceiptPreviewProps,
  MOCK_SHOP_INFO,
  VatCalculationMode,
} from "../../types/Receipt";
import StandardReceipt from "../(receipt)/StandardReceipt";
import { printReceiptToPDF } from "../../utils/printUtils";
import ConfirmationModal from "./ConfirmationModal";
import { useConfirmation } from "../../hooks/useConfirmation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { usePasswordPrompt } from "../../hooks/usePasswordPrompt";
import FormInvoice from "../(receipt)/FormInvoice";
import PasswordPromptModal from "./PasswordPromptModal";
import PosAddressForm from "./PosAddressForm";
import {
  Customer,
  StaffMember,
  StructuredAddress,
  Discount,
} from "../../types/Pos";
import { PaymentMethod } from "./(payment)/PaymentModal";

const PAPER_SIZES_CSS = {
  "80mm": "w-[80mm] text-[11px] leading-normal",
  "58mm": "w-[58mm] text-[9px] leading-tight",
  A5: "w-[148mm] h-[210mm] text-[11px] leading-relaxed",
};

const motionContainerProps = {
  initial: { opacity: 0, height: 0, y: -10 },
  animate: { opacity: 1, height: "auto", y: 0 },
  exit: { opacity: 0, height: 0, y: -10 },
  transition: { duration: 0.2 },
  style: { overflow: "hidden" },
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
  paymentMethod: PaymentMethod;
  // ✅ KEY CHANGE: Add props for tax invoice toggle
  isTaxInvoice: boolean;
  setIsTaxInvoice: (value: boolean) => void;
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
  paymentMethod,
  isTaxInvoice,
  setIsTaxInvoice,
}: SummaryModalProps) {
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    shopName: MOCK_SHOP_INFO.companyName,
    shopAddress: MOCK_SHOP_INFO.address,
    shopTaxId: MOCK_SHOP_INFO.taxId,
    shopBranch: MOCK_SHOP_INFO.branch,
    receiptNumber: `IV${new Date().getFullYear().toString().slice(2)}/01-00001`,
    taxInvoiceNumber: "",
    customerName: "ลูกค้าทั่วไป",
    customerPhone: "",
    printDate: new Date().toLocaleDateString("th-TH"),
    customerTaxId: "",
    customerAddress: "",
    customerBranch: "สำนักงานใหญ่",
    customerType: "individual",
    bookNumber: "116",
  });

  const [structuredAddress, setStructuredAddress] = useState<StructuredAddress>(
    {
      addressDetails: "",
      subdistrict: "",
      district: "",
      province: "",
      postcode: "",
    },
  );

  const [selectedIssuerId, setSelectedIssuerId] = useState<string>(
    currentIssuer.adminId,
  );
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    showDiscounts: true,
    showDiscountNames: true,
    applyWithholdingTax: false,
    isTaxInvoice: false, // Default to false, will be synced with prop
    showTaxInvoiceNumber: true,
    showCustomerBranch: true,
    showCustomerAddress: true,
    showCustomerPhone: false,
    showCustomerTaxId: false,
    vatMode: "off",
    withholdingTaxVatMode: "pre-vat",
  });
  const [receiptType, setReceiptType] = useState<
    "receipt" | "bookstoreInvoice"
  >("receipt");
  const [paperSize, setPaperSize] = useState<"80mm" | "58mm" | "A5">("80mm");

  const [isDocNumberEditable, setIsDocNumberEditable] =
    useState<boolean>(false);

  const receiptPreviewRef = useRef<HTMLDivElement>(null);
  const confirmation = useConfirmation();
  const { prompt: promptForPassword, promptProps } = usePasswordPrompt();

  // ✅ KEY CHANGE: Sync internal printOptions with the isTaxInvoice prop from parent
  useEffect(() => {
    setPrintOptions((p) => ({ ...p, isTaxInvoice }));
  }, [isTaxInvoice]);

  useEffect(() => {
    if (receiptData.customerType === "company") {
      setPrintOptions((p) => ({ ...p, applyWithholdingTax: true }));
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

      const now = new Date();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");
      const mockSequence = "004";
      const newTaxInvoiceNumber = `OKS${month}${day}${mockSequence}`;

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
        taxInvoiceNumber: newTaxInvoiceNumber,
        customerName: customer?.name || "ลูกค้าทั่วไป",
        customerPhone: customer?.phone || "",
        printDate: new Date().toLocaleDateString("th-TH"),
        customerTaxId: customer?.citizenId || "",
        customerAddress: customer?.address || "",
        customerBranch: customer?.branch || "สำนักงานใหญ่",
        customerType: customer?.customerType || "individual",
        bookNumber: "116",
      });

      setStructuredAddress({
        addressDetails: customer?.address || "",
        subdistrict: "",
        district: "",
        province: "",
        postcode: "",
      });

      setSelectedIssuerId(currentIssuer.adminId);
      setPrintOptions((prev) => ({
        ...prev,
        isTaxInvoice, // Sync with prop on open
        showDiscounts: true,
        showDiscountNames: true,
        showTaxInvoiceNumber: true,
        showCustomerBranch: true,
        showCustomerAddress: true,
      }));
      setReceiptType("receipt");
      setPaperSize("80mm");
      setIsDocNumberEditable(false);
    }
  }, [isOpen, customer, currentIssuer, isTaxInvoice]);

  const handleDataChange = (field: keyof ReceiptData, value: string) => {
    setReceiptData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const { addressDetails, subdistrict, district, province, postcode } =
      structuredAddress;

    const addressParts = [
      addressDetails,
      subdistrict ? `ต./แขวง ${subdistrict}` : "",
      district ? `อ./เขต ${district}` : "",
      province ? `จ.${province}` : "",
      postcode,
    ];

    const fullAddress = addressParts.filter(Boolean).join(" ");
    if (fullAddress !== receiptData.customerAddress) {
      handleDataChange("customerAddress", fullAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structuredAddress]);

  const handleAddressPartChange = (
    field: keyof StructuredAddress,
    value: string,
  ) => {
    setStructuredAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUnlockDocNumbers = async () => {
    if (isDocNumberEditable) return;

    const password = await promptForPassword({
      title: "ต้องการสิทธิ์แก้ไข",
      message: "กรุณาใส่รหัสผ่านของผู้ดูแลเพื่อดำเนินการต่อ",
    });

    const MOCK_PASSWORD = "1234";

    if (password === MOCK_PASSWORD) {
      setIsDocNumberEditable(true);
      confirmation.showConfirmation({
        title: "ปลดล็อคสำเร็จ",
        message: "คุณสามารถแก้ไขเลขที่เอกสารได้แล้ว",
        type: "success",
        confirmText: "ตกลง",
        showCancel: false,
      });
    } else if (password !== null) {
      confirmation.showConfirmation({
        title: "รหัสผ่านไม่ถูกต้อง",
        message: "คุณไม่มีสิทธิ์แก้ไขข้อมูลส่วนนี้",
        type: "error",
        confirmText: "ตกลง",
        showCancel: false,
      });
    }
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
        message: `เกิดข้อผิดพลาดในการพิมพ์: ${error instanceof Error ? error.message : "Unknown error"
          }`,
        type: "error",
        confirmText: "ตกลง",
        showCancel: false,
      });
    }
  };

  const selectedIssuer =
    billIssuers.find((s) => s.adminId === selectedIssuerId) || currentIssuer;

  const receiptProps: ReceiptPreviewProps & { customer: Customer | null } = {
    receiptData,
    items,
    subtotal,
    total,
    issuer: selectedIssuer,
    options: printOptions,
    withholdingTaxPercent: withholdingTaxPercent,
    discounts: discounts,
    customer: customer,
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isFullscreen={true}>
        <div className="flex h-screen w-screen flex-col bg-gray-50 md:flex-row dark:bg-gray-950">
          <div className="no-scrollbar w-full flex-shrink-0 overflow-y-auto bg-white px-2 md:w-1/3 md:px-5 dark:bg-gray-900">
            <div className="z-20 -mx-2 bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-3 text-white shadow-sm md:sticky md:top-0 md:-mx-5 md:px-5 md:py-4">
              <h3 className="text-lg font-bold md:text-xl">พิมพ์ใบสรุปยอด</h3>
            </div>

            <div className="mt-3 space-y-3 pb-8 md:mt-8 md:space-y-5">
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
                <AnimatePresence>
                  {receiptType === "receipt" && (
                    <motion.div {...motionContainerProps}>
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
                {/* ✅ เบอร์โทรศัพท์ พร้อม checkbox (แสดงเมื่อกรอกชื่อแล้ว) */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="customerPhone"
                      className="block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
                    >
                      เบอร์โทรศัพท์
                    </label>
                    {receiptData.customerName && receiptData.customerName !== "ลูกค้าทั่วไป" && (
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={printOptions.showCustomerPhone}
                          onChange={(e) =>
                            setPrintOptions((p) => ({
                              ...p,
                              showCustomerPhone: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          พิมพ์
                        </span>
                      </label>
                    )}
                  </div>
                  <InputField
                    label=""
                    value={receiptData.customerPhone}
                    onChange={(e) =>
                      handleDataChange("customerPhone", e.target.value)
                    }
                  />
                </div>
                {/* ✅ รหัสประจำตัวประชาชน พร้อม checkbox (แสดงเมื่อกรอกชื่อแล้ว) */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="customerTaxId"
                      className="block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
                    >
                      {receiptData.customerType === "company"
                        ? "เลขประจำตัวผู้เสียภาษี"
                        : "เลขประจำตัวประชาชน / ผู้เสียภาษี"}
                    </label>
                    {receiptData.customerName && receiptData.customerName !== "ลูกค้าทั่วไป" && (
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={printOptions.showCustomerTaxId}
                          onChange={(e) =>
                            setPrintOptions((p) => ({
                              ...p,
                              showCustomerTaxId: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          พิมพ์
                        </span>
                      </label>
                    )}
                  </div>
                  <InputField
                    label=""
                    value={receiptData.customerTaxId}
                    onChange={(e) =>
                      handleDataChange("customerTaxId", e.target.value)
                    }
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="customerAddress"
                      className="block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400"
                    >
                      ที่อยู่
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={printOptions.showCustomerAddress}
                        onChange={(e) =>
                          setPrintOptions((p) => ({
                            ...p,
                            showCustomerAddress: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        พิมพ์
                      </span>
                    </label>
                  </div>
                  <PosAddressForm
                    addressData={structuredAddress}
                    onAddressChange={handleAddressPartChange}
                    variants="compact"
                  />
                </div>
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
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold tracking-wide text-gray-700 uppercase dark:text-gray-300">
                    ข้อมูลเอกสาร
                  </h4>
                  <Button
                    variant="outline"
                    onClick={handleUnlockDocNumbers}
                    className={clsx(
                      "transition-colors",
                      isDocNumberEditable
                        ? "cursor-default text-green-600"
                        : "text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400",
                    )}
                    aria-label="แก้ไขเลขที่เอกสาร"
                  >
                    {isDocNumberEditable ? (
                      <FaUnlock size={14} />
                    ) : (
                      <FaPen size={14} />
                    )}
                  </Button>
                </div>

                <InputField
                  label="เลขที่เอกสาร"
                  value={receiptData.receiptNumber}
                  onChange={(e) =>
                    handleDataChange("receiptNumber", e.target.value)
                  }
                  disabled={!isDocNumberEditable}
                />

                <AnimatePresence>
                  {printOptions.isTaxInvoice &&
                    printOptions.showTaxInvoiceNumber && (
                      <motion.div {...motionContainerProps}>
                        <InputField
                          label="เลขที่ใบกำกับภาษี"
                          value={receiptData.taxInvoiceNumber}
                          onChange={(e) =>
                            handleDataChange("taxInvoiceNumber", e.target.value)
                          }
                          disabled={!isDocNumberEditable}
                        />
                      </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                  {receiptType === "bookstoreInvoice" && (
                    <motion.div {...motionContainerProps}>
                      <InputField
                        label="เล่มที่"
                        value={receiptData.bookNumber}
                        onChange={(e) =>
                          handleDataChange("bookNumber", e.target.value)
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                    ผู้ขายสินค้า
                  </label>
                  <select
                    value={selectedIssuerId}
                    onChange={(e) =>
                      setSelectedIssuerId(e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    {billIssuers.map((staff) => (
                      <option key={staff.adminId} value={staff.adminId}>
                        {staff.fullName}
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
                      onChange={(e) => {
                        const checked = e.target.checked;
                        // ✅ KEY CHANGE: Update both internal and parent state
                        setPrintOptions((p) => ({
                          ...p,
                          isTaxInvoice: checked,
                        }));
                        setIsTaxInvoice(checked);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                )}

                <AnimatePresence>
                  {printOptions.isTaxInvoice && (
                    <motion.div {...motionContainerProps} className="space-y-3">
                      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          แสดงเลขที่ใบกำกับภาษี
                        </span>
                        <input
                          type="checkbox"
                          checked={printOptions.showTaxInvoiceNumber}
                          onChange={(e) =>
                            setPrintOptions((p) => ({
                              ...p,
                              showTaxInvoiceNumber: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>

                      <div className="space-y-2.5 rounded-lg border border-blue-200/50 bg-blue-50/30 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
                        <label className="mb-3 block text-xs font-bold tracking-wide text-blue-700 uppercase dark:text-blue-300">
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

                      {receiptData.customerType === "company" && (
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

                      <div className="space-y-2.5 rounded-lg border border-amber-200/50 bg-amber-50/30 p-3 dark:border-amber-900/30 dark:bg-amber-950/20">
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
                        <AnimatePresence>
                          {printOptions.applyWithholdingTax && (
                            <motion.div
                              {...motionContainerProps}
                              className="space-y-2 pt-2"
                            >
                              <div>
                                <label className="mb-1 block text-xs font-medium text-amber-700 dark:text-amber-300">
                                  เปอร์เซ็นต์ (%)
                                </label>
                                <input
                                  type="number"
                                  value={withholdingTaxPercent}
                                  onChange={(e) =>
                                    setWithholdingTaxPercent(
                                      Number(e.target.value),
                                    )
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
                                      printOptions.withholdingTaxVatMode ===
                                      "pre-vat"
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
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                <AnimatePresence>
                  {printOptions.showDiscounts && (
                    <motion.div {...motionContainerProps}>
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
                className={`font-lineseed bg-white text-black shadow-2xl ${PAPER_SIZES_CSS[paperSize]
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
                          paymentMethod={paymentMethod}
                        />
                      );
                    case "bookstoreInvoice":
                      return (
                        <FormInvoice
                          {...receiptProps}
                          paymentMethod={paymentMethod}
                        />
                      );
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

      <PasswordPromptModal {...promptProps} />
    </>
  );
}
