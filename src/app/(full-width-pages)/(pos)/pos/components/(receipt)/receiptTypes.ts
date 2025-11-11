import { SelectedItem } from "../../page";
import { Discount } from "../(modal)/DiscountModal";

export interface StaffMember {
  id: number;
  name: string;
}

export const MOCK_SHOP_INFO = {
  companyName: "บริษัท โอเคโมบาย จำกัด",
  formalName: "บริษัท โอเคโมบาย จำกัด",
  formalAddressLine1: "1 Ratchawithi Rd, Thanon Phaya Thai, Ratchathewi",
  formalAddressLine2: "Bangkok 10400",
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
  customerType: "individual" | "company"; // <-- ADDED
  bookNumber: string;
}

export interface PrintOptions {
  showDiscounts: boolean;
  showDiscountNames: boolean;
  applyWithholdingTax: boolean;
  isTaxInvoice: boolean;
  showCustomerBranch: boolean; // <-- ADDED
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
