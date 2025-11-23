# สร้าง Route requirement
1. /add-to-cart
2. /remove-from-cart
3. /checkout
4. /cancel-checkout
5. /confirm-payment
6. /get-cart

# สร้าง Table requirement
1. pos_cart {เก็บสินค้าที่กำลังจะขาย ซิงค์กับสินค้าที่ add บนหน้า frontend กันไฟดับ 100%}
2. pos_history {เก็บสินค้าที่ขายไปแล้ว}

- pos_cart : nosql_table : structure {เก็บสินค้าที่กำลังจะขาย ซิงค์กับสินค้าที่ add บนหน้า frontend กันไฟดับ 100%}
  {
    _id: objectId
    unique_id: {สร้างไว้ดูสินค้า barcode ซ้ำ}
    createdAt: {เวลาที่เพิ่มไป cart}
    expiredAt: {สร้างใหม่เป็นเวลาที่นับ +15 นาที}
    status: "holding" | "pending" {เพิ่มสินค้าที่กำลังจะขาย}
    data: {
      // ให้เก็บข้อมูลสินค้าที่เพิ่มไปใน cart จะได้ไม่ต้อง query ข้อมูลสินค้าอีกรอบหลักเรียก pos_cart
      barcode: {IMEI/SN}
      productId: {สร้างใหม่เป็น ObjectId}
      stockPrice: {ราคาปลีก}
      soldPrice: {ราคาขาย}
      discountAmount: {ส่วนลด}
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
  }

- pos_history : nosql_table : structure {เก็บสินค้าที่ขายไปแล้ว สำหรับดูใบเสร็จย้อนหลัง}
  {
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
      }
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


# 1. Adding item to cart - /add-to-cart

## สิ่งที่ต้องตรวจสอบ
  - ยอดคงเหลือ หรือ available ของสินค้าที่กำลังจะเพิ่ม

## สิ่งที่ต้องทำ
  - หักยอดคงเหลือ หรือ available ของสินค้าที่กำลังจะเพิ่ม
  - INSERT item ไปที่ pos_cart
  - ตอบกลับ http-status

## request
  - add_to_cart/{_id}

## response
  - ผ่าน: ตอบ http-status
  - ไม่ผ่าน: ตอบกลับสาเหตุ


# 2. Remove item from the cart /remove-from-cart

## สิ่งที่ต้องทำ
  - ลบสินค้าออกจาก pos_cart

## request
  - /remove-from-cart/{unique_id}

## response
  - ผ่าน: ตอบ http-status
  - ไม่ผ่าน: ตอบสาเหตุที่ไม่ผ่าน

# 3. Checkout items in cart กดชำระเงินบนหน้า POS หลัก -> to payment process - /checkout

## สิ่งที่ต้องตรวจสอบ
  - ตรวจสอบสถานะด้วย unique_id บน pos_cart มี holding ที่ไม่ expired ไหม (มีค่าถูกต้องเมื่อเทียบ expiredAt)
    - เจอและไม่ expired: แปลว่าสามารถชำระเงินได้ผ่าน
    - เจอและ expired: ตอบกลับเป็น http-status ล้มเหลวและลบรายการที่ expired ออกจาก pos_cart
    - ไม่เจอ: อาจจะถูกลบออกไปแล้ว -> ต้องกดเพิ่มใหม่

## สิ่งที่ต้องทำ
  - เปลี่ยนสถานะของสินค้า unique_id ใน cart ทั้งหมดเป็น pending ถ้าผ่านการตรวจสอบ
  - ลบ item ที่ expired ออกจาก pos_cart ไปถ้าเทียบแล้วหมดอายุ

# 4. ยกเลิกการชำระเงิน (อาจจะย้อนกลับไปเพิ่มสินค้าหรือยกเลิกจริงๆ) /cancel-checkout

## สิ่งที่ต้องทำ
  - เปลี่ยนรายการสินค้าบน pos_cart ทั้งหมดไปเป็น holding เหมือนเดิมแล้วเขียนทับ expiredAt ใหม่ (+15 นาที)

# 5. ยืนยันการชำระเงิน (สด กับ โอนเงินธนาคาร) /confirm-payment
  - ควรตอบกลับสำเร็จเท่านั้น และ หักสต็อกจริงๆ ลบรายการทั้งหมดบน pos_cart
  - สร้างรายการซื้อขายไปที่ pos_history
  - ตอบกลับเป็นรายการซื้อขายของ product ที่ทำการซื้อขายไป (เทียบจาก barcode ไปหา product มา)

## กรณีล้มเหลวแต่จ่ายเงินแล้ว
  - (ขายออนไลน์) ต้องคืนเงินหน้าร้าน เพราะระบบผิดปกติ
  - (ขายหน้าร้าน) คนที่ซื้อออนไลน์อาจจะซื้อของชิ้นนี้ไปถ้าหากเราขายสินค้าหน้าร้านไปแล้วจดมือเอา จากเหตุการณ์ระบบผิดพลาด อันนี้ต้องแก้ระบบขายออนไลน์
  
# 6. เรียกดูสินค้าบน pos_cart /get-cart
  - ดึงรายการทั้งหมดบน pos_cart มาตอบกลับเป็น pos_cart items

# Server State เข้มๆ
- ต้อง fetch/refetch ที่สถานการณ์ไหนบ้างจาก action ไหนบ้าง
    1. กรณีเริ่มแรก fetch get-cart
    2. กรณี checkout failed (ชำระเงินล้มเหลว) refetch get-cart
    3. หลังชำระเงินสำเร็จจะได้ data คืนมาเอาอันนั้นไปพิมพ์
- ถ้าลูกค้าต้องการพิมพ์บิลเงินสดต้องไปที่หน้า customer ก่อนที่จะกดชำระเงินเพื่อกรอก ชื่อ ที่อยู่ เบอร์โทรลูกค้า

# 7. การจัดการ pos_payment
- เก็บข้อมูลการชำระเงินของเครื่อง POS ได้ทุกเคส เมื่อสำเร็จจะล้างข้อมูลทิ้งเตรียมรับการขายครั้งใหม่

## pos_payment : nosql_table : structure {เก็บข้อมูลการชำระเงินของเครื่อง POS}

## สิ่งที่ต้องทำ
  - เมื่อมีการชำระเงินเข้ามา (confirm-payment) ให้บันทึก transaction ลงใน array transactions และอัพเดทยอดเงินใน summary
  - เมื่อชำระเงินครบถ้วนหลังจากบันทึก transaction สุดท้ายแล้ว ให้ล้าง pos_payment 
  - ถ้ามีการยกเลิกการชำระเงิน (cancel-checkout) ให้ล้าง pos_payment

## route
  - /get-payment : ดึงข้อมูลการชำระเงินปัจจุบัน ตอบกลับเป็น pos_payment object (อาจะมีหลาย transaction ในกรณี mixed payment)

{
  _id: string;              // ObjectId

  // Snapshot ยอดเงิน (ต้อง Sync กับ pos_cart)
  summary: {
    subtotal: number;       // ราคาสินค้ารวมจาก Cart
    discount: number;       // ส่วนลดท้ายบิล
    grandTotal: number;     // ยอดที่ต้องจ่ายจริง
    totalPaid: number;      // ยอดที่จ่ายเข้ามาแล้ว
    remaining: number;      // ยอดค้างชำระ
  };

  // ถ้าเจอหลาย transaction เป็น mixed payment
  transactions: {
    _id: string;            // UUID
    method: "CASH" | "PROMPTPAY" | "CARD" | "TRANSFER" | "ONLINE";
    amount: number;         
    tendered?: number;      // ยอดเงินที่รับมา (กรณีจ่ายสด)      
    change?: number;        // เงินทอน (กรณีจ่ายสด)
    status: "SUCCESS" | "PENDING" | "FAILED"; 
    timestamp: Date;
  }[];

  updatedAt: string;    // เวลาที่อัพเดทล่าสุด
}

