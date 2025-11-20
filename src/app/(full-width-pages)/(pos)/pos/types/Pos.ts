// In file: pos/types/Pos.ts

export type CustomerLevelType = "ทั่วไป" | "Silver" | "Gold" | "Platinum" | "Diamond";

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

// MARK: - REVISED Product Interface
export interface Product {
  id: number;
  _id: string; // MongoDB ObjectId
  name: string;
  barcode: string;
  price: number;
  cost: number;
  brand: string;
  condition: "new" | "used";
  stock: number;
  createdAt: Date;
  categoryColor?: string;
  details: string;
  source?: string;
  imageApi?: string;
  image1?: string;
  category: {
    id: string;
    color: string;
    name: string;
  };
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
  id: string; // id ส่วนลด
  name: string; // ชื่อส่วนลด
  type: "percentage" | "fixed"; // ยอดลดเป็น % หรือราคาที่ลดเป๊ะๆ
  value: number; // ราคาที่ได้
  code?: string; // รหัส
}

// รายการขาย
export interface OrderPayload {
  id: string; // เลขที่การซื้อขาย เลขระบุ mongoId (objectId)
  sellerId: string; // ผู้ขาย เลขระบุ mongoId (objectId)
  customer: {
    customerId?: string; // id ลูกค้า เลขระบุด้วย mongoId (objectId)
    customerType: "individual" | "company"; // ประเภทผู้ซื้อ บุคคล หรือ นิติบุคคล
    isMember: boolean; // เป็นสมาชิกหรือไม่
    customerName?: string; // ชื่อลูกค้า
    customerAddress?: string; // ที่อยู่ลูกค้า
    customerPhone?: string; // เบอร์โทรศัพท์ลูกค้า
  };
  product: [
    {
      productId: string; // product เลขระบุด้วย mongoId (objectId)
      name_md5: string;
      barcode: string; // เลข IMEI/SN
      barcode_md5: string;
      stockPrice: number; // ราคาปลีก
      soldPrice: number; // ราคาขาย
      discountAmount: number; // ส่วนลด
    },
  ];
  note?: string; // โน้ตตอนขาย หรือ เป็นยอดบริษัท
  discountId?: string; // ส่วนลด เลขระบุด้วย mongoId (objectId)
  documentId?: string; // เลขที่เอกสาร ถ้าเป็นการซื้อทั่วไป (generate เองมี pattern)
  taxDocumentId?: string; // เลขที่ใบกำกับภาษี (generate เองมี pattern)
  isTaxInvoice: boolean; // เป็นใบกำกับภาษี
  vatMode?: "included" | "excluded"; // ภาษีรวม หรือ แยก
  discountAmount?: number; // ยอดส่วนลด
  totalAmount: number; // ยอดสุทธิ
  receivedPoint?: number; // แต้มที่ได้จากการซื้อขายครั้งนี้
  currentPoint?: number; // แต้มสะสมของสมาชิก
  createdAt: string; // วันที่ซื้อขาย
}
