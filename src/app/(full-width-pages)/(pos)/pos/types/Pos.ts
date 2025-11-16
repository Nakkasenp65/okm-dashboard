export type CustomerLevelType =
  | "ทั่วไป"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond";

export interface Customer {
  id: string;
  name: string;
  level: CustomerLevelType;
  phone: string;
  memberId: string;
  emoji: string;
  color: string;
  age?: number;
  notes?: string;
  citizenId?: string;
  address?: string;
  branch?: string;
  customerType?: "individual" | "company";
  customerPoint?: number;
}

export interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  brand: string;
  condition: "มือหนึ่ง" | "มือสอง" | "อุปกรณ์เสริม";
  stock: number;
  createdAt: Date;
  categoryColor?: string;
}

export interface StructuredAddress {
  addressDetails: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
}

export interface StaffMember {
  id: number;
  name: string;
}

export interface Discount {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  code?: string;
}
