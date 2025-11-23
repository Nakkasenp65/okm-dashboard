// src/app/(full-width-pages)/(pos)/pos/types/Receipt.ts

import { SelectedItem } from "../page";
import { Discount, StaffMember } from "./Pos";

// TODO: เพิ่มรายละเอียดอื่น ๆ ของร้านค้าได้ตามต้องการ
export const MOCK_SHOP_INFO = {
  companyName: "บริษัท โอเคโมบาย จำกัด",
  formalName: "บริษัท โอเคโมบาย จำกัด",
  formalAddressLine1:
    "โอเคโมบาย ห้างเซ็นเตอร์วัน ชั้น 2 ห้องเลขที่ 2019 เลขที่ 1 แขวงถนนพญาไท เขตราชเทวี",
  formalAddressLine2: "กรุงเทพฯ 10400",
  formalPhone: "โทร. 0-2470-8222, 0-2470-8224",
  logoUrl: "/images/logo/logo-icon.png",
  companyNameEn: "OK MOBILE LTD.",
  address:
    "โอเคโมบาย ห้างเซ็นเตอร์วัน ชั้น 2 ห้องเลขที่ 2019 เลขที่ 1 แขวงถนนพญาไท เขตราชเทวี",
  phone: "062-776-6774",
  LINE: "@okmobile (มี@)",
  taxId: "0115544990123",
  branch: "สาขาที่ออกใบกำกับภาษี สำนักงานใหญ่",
};

export interface ReceiptData {
  shopName: string;
  shopAddress: string;
  shopTaxId: string;
  shopBranch: string;
  receiptNumber: string;
  taxInvoiceNumber: string;
  customerName: string;
  customerPhone: string;
  printDate: string;
  customerTaxId: string;
  customerAddress: string;
  customerBranch: string;
  customerType: "individual" | "company";
  bookNumber: string;
}

export type VatCalculationMode = "included" | "excluded" | "off";

export interface PrintOptions {
  showDiscounts: boolean;
  showDiscountNames: boolean;
  applyWithholdingTax: boolean;
  isTaxInvoice: boolean;
  showCustomerBranch: boolean;
  vatMode: VatCalculationMode;
  withholdingTaxVatMode: "post-vat" | "pre-vat";
  showCustomerAddress: boolean;
  showTaxInvoiceNumber: boolean;
  showCustomerPhone: boolean;
  showCustomerTaxId: boolean;
}

export interface ReceiptPreviewProps {
  receiptData: ReceiptData;
  items: SelectedItem[];
  subtotal: number;
  total: number;
  issuer: StaffMember;
  options: PrintOptions;
  withholdingTaxPercent: number;
  discounts: Discount[];
}
