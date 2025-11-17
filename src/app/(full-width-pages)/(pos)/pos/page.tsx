"use client";
import { FaArrowLeftLong } from "react-icons/fa6";
import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../../components/ui/button/Button";
import SellingDetails from "./components/SellingDetails";
import SellingAction from "./components/SellingAction";
import SidebarMenu from "./components/SidebarMenu";
import POSLockScreen from "./components/(modal)/POSLockScreenModal";
import CustomerModal from "./components/(modal)/CustomerModal";
import PaymentModal, { Payment, PaymentMethod } from "./components/(modal)/PaymentModal";
import CashDrawerModal, { CashDrawerActivity } from "./components/(modal)/CashDrawerModal";
import SummaryModal from "./components/(modal)/SummaryModal";
import DiscountModal from "./components/(modal)/DiscountModal";
import ConfirmationModal from "./components/(modal)/ConfirmationModal";
import { useConfirmation } from "./hooks/useConfirmation";
import SellerProfile from "./components/SellerProfile";
import { FaUser, FaTag, FaCashRegister, FaBoxArchive, FaPrint } from "react-icons/fa6";
import { Customer, Product, StaffMember, Discount } from "./types/Pos";
import { VatCalculationMode } from "./types/Receipt";
import { useProducts, useUpdateProduct, UpdateProductPayload } from "./hooks/useProduct";

// MARK: - Interfaces and Mock Data
export interface CashDrawerTransaction extends CashDrawerActivity {
  id: string;
  timestamp: Date;
}

export interface SubItem {
  uniqueId: string;
  productId: number;
  name: string;
  unitPrice: number;
  imei?: string;
}

export interface GroupedProduct {
  productId: number;
  name: string;
  items: SubItem[];
}

export interface SelectedItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  originalPrice: number;
}

export type PosMode = "retail" | "company" | "record-income";
type PosOperationMode = "sell" | "consignment" | "repair";

const MOCK_STAFF: StaffMember[] = [
  { id: 1, name: "Noppadol Lerptakool" },
  { id: 2, name: "Weerapong Ponsena" },
  { id: 3, name: "Admin (ผู้ดูแลระบบ)" },
];

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "สมชาย ใจดี",
    level: "Diamond",
    phone: "081-234-5678",
    memberId: "OKM001",
    emoji: "👑",
    color: "from-pink-400 to-rose-600",
    age: 45,
    citizenId: "1234567890123",
    address: "123 ถนนสีวลี ซอยพัฒนา แขวงเพชรบุรี เขตราชเทวี กรุงเทพฯ 10400",
    customerPoint: 12500,
  },
  {
    id: "2",
    name: "สมหญิง มีสุข",
    level: "Platinum",
    phone: "082-345-6789",
    memberId: "OKM002",
    emoji: "💎",
    color: "from-cyan-400 to-blue-600",
    age: 32,
    citizenId: "2345678901234",
    address: "456 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400",
    customerPoint: 8200,
  },
];

const operationModes = [
  { id: "sell", label: "ขายซื้อ" },
  { id: "consignment", label: "ขายฝาก" },
  { id: "repair", label: "ซ่อม" },
];

// MARK: - STABLE QUERY OPTIONS
// การประกาศ Object นี้ไว้นอก Component ทำให้มันถูกสร้างแค่ครั้งเดียว
// และเป็นค่าที่ "เสถียร" (Stable) ป้องกันการ re-fetch ซ้ำซ้อนใน `useProducts`
const productQueryOptions = { limit: 100 };

export default function Page() {
  // Section: Data Fetching & Mutations
  // NOTE: ยังต้องดึงข้อมูลสินค้าทั้งหมดสำหรับคำนวณ stock และ productsMap
  const { data: productsData } = useProducts(productQueryOptions);
  const updateProductMutation = useUpdateProduct();

  // Section: Memoized Data Transformation
  // `allProducts` คือ "แหล่งข้อมูลความจริง" (Single Source of Truth) สำหรับข้อมูลสินค้าและสต็อกตั้งต้น
  const allProducts = useMemo(() => productsData?.products || [], [productsData]);

  const productsMap = useMemo(() => {
    const map = new Map<number, Product>();
    allProducts.forEach((product) => {
      map.set(product.id, product);
    });
    return map;
  }, [allProducts]);

  // Section: POS State Management
  // State หลักที่ขับเคลื่อน UI คือ `selectedProducts` (ตะกร้าสินค้า)
  const [selectedProducts, setSelectedProducts] = useState<Map<number, GroupedProduct>>(new Map());

  // States อื่นๆ สำหรับจัดการ UI
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState<Discount[]>([]);
  const [, setCashDrawerTransactions] = useState<CashDrawerTransaction[]>([]);
  const [currentIssuer, setCurrentIssuer] = useState<StaffMember>(MOCK_STAFF[0]);
  const [activePosOperationMode, setActivePosOperationMode] = useState<PosOperationMode>("sell");

  // Section: Payment and Tax State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [vatMode, setVatModeState] = useState<VatCalculationMode>("off");
  const [withholdingTaxPercent, setWithholdingTaxPercentState] = useState<number>(0);
  const [withholdingTaxVatMode, setWithholdingTaxVatModeState] = useState<"pre-vat" | "post-vat">("pre-vat");
  const [isTaxInvoice, setIsTaxInvoice] = useState<boolean>(false);

  // Section: Modal and UI State
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCashDrawerModalOpen, setIsCashDrawerModalOpen] = useState(false);
  const [paymentModalInfo, setPaymentModalInfo] = useState<{ isOpen: boolean; mode: PosMode }>({
    isOpen: false,
    mode: "retail",
  });
  const [isLockedScreen, setIsLockedScreen] = useState(true);
  const confirmation = useConfirmation();
  const router = useRouter();
  const POS_PIN = "1234";

  // MARK: - NEW DERIVED STATE FOR STOCK (NO MORE useEffect, NO MORE useState for currentStock)
  // คำนวณสต็อกที่พร้อมขายได้แบบ Real-time โดยไม่ต้องใช้ State แยก
  // นี่คือการ "Derive State" ซึ่งเป็น Pattern ที่ดีและป้องกัน Loop ได้อย่างถาวร
  const availableStock = useMemo(() => {
    const stockMap = new Map<number, number>();
    // 1. เริ่มต้นด้วยสต็อกจริงจาก Server
    allProducts.forEach((p) => stockMap.set(p.id, p.stock));

    // 2. วนลูปในตะกร้าเพื่อหักลบจำนวนสินค้าที่ถูกเลือกไปแล้ว
    for (const group of selectedProducts.values()) {
      const currentServerStock = stockMap.get(group.productId) || 0;
      stockMap.set(group.productId, currentServerStock - group.items.length);
    }
    return stockMap;
  }, [allProducts, selectedProducts]); // จะคำนวณใหม่ต่อเมื่อข้อมูลจาก Server หรือตะกร้าเปลี่ยนแปลง

  // Section: Handlers and Callbacks
  const setVatMode = useCallback((mode: VatCalculationMode) => setVatModeState(mode), []);
  const setWithholdingTaxPercent = useCallback((percent: number) => setWithholdingTaxPercentState(percent), []);
  const setWithholdingTaxVatMode = useCallback(
    (mode: "pre-vat" | "post-vat") => setWithholdingTaxVatModeState(mode),
    [],
  );

  const handleUnlockScreen = (pin: string) => {
    if (pin === POS_PIN) {
      setIsLockedScreen(false);
    }
  };

  // ฟังก์ชันนี้จะจัดการแค่การอัปเดตตะกร้า (`selectedProducts`) เท่านั้น
  // `availableStock` จะถูกคำนวณใหม่โดยอัตโนมัติจาก `useMemo` ด้านบน
  const addProductToCart = useCallback(
    (productToAdd: Product) => {
      const stock = availableStock.get(productToAdd.id) || 0;
      if (stock <= 0) {
        console.warn(`สินค้า ID: ${productToAdd.id} หมดสต็อกแล้ว`);
        return; // ป้องกันการเพิ่มสินค้าที่หมดสต็อก
      }

      setSelectedProducts((prevMap) => {
        const newMap = new Map(prevMap);
        const existingGroup = newMap.get(productToAdd.id);
        const imei = productToAdd.barcode;
        const newSubItem: SubItem = {
          uniqueId: `${productToAdd.id}-${Date.now()}-${Math.random()}`,
          productId: productToAdd.id,
          name: productToAdd.name,
          unitPrice: productToAdd.price,
          imei: imei,
        };

        if (existingGroup) {
          const updatedGroup: GroupedProduct = {
            ...existingGroup,
            items: [...existingGroup.items, newSubItem],
          };
          newMap.set(productToAdd.id, updatedGroup);
        } else {
          newMap.set(productToAdd.id, {
            productId: productToAdd.id,
            name: productToAdd.name,
            items: [newSubItem],
          });
        }
        return newMap;
      });
    },
    [availableStock],
  ); // ขึ้นอยู่กับ `availableStock` เพื่อตรวจสอบว่าสามารถเพิ่มสินค้าได้หรือไม่

  // MARK: - SIMPLIFIED updateCart
  // ฟังก์ชันนี้ก็จัดการแค่การอัปเดตตะกร้าเช่นกัน
  const updateCart = (productId: number, updatedItems: SubItem[]) => {
    setSelectedProducts((prevMap) => {
      const newMap = new Map(prevMap);
      if (updatedItems.length === 0) {
        newMap.delete(productId);
      } else {
        const group = newMap.get(productId);
        if (group) {
          const updatedGroup: GroupedProduct = { ...group, items: updatedItems };
          newMap.set(productId, updatedGroup);
        }
      }
      return newMap;
    });
  };

  const handleCashDrawerActivity = (activity: CashDrawerActivity) => {
    const newTransaction: CashDrawerTransaction = {
      ...activity,
      id: `trans_${Date.now()}`,
      timestamp: new Date(),
    };
    setCashDrawerTransactions((prev) => [...prev, newTransaction]);
  };

  const handlePaymentSuccess = (payments: Payment[], change: number) => {
    console.log("ชำระเงินสำเร็จ กำลังอัปเดตสต็อกบนเซิร์ฟเวอร์...", { payments, change });

    const updatePromises = Array.from(selectedProducts.values()).map((group) => {
      const product = productsMap.get(group.productId);
      if (!product) return Promise.resolve();

      const quantitySold = group.items.length;
      const newStockLevel = product.stock - quantitySold;
      const finalStock = Math.max(0, newStockLevel);

      const payload: UpdateProductPayload = {
        quantity: finalStock,
      };

      return updateProductMutation.mutateAsync({ id: product.id, payload });
    });

    Promise.all(updatePromises)
      .then(() => {
        console.log("อัปเดตสต็อกทั้งหมดสำเร็จ");
        // `onSettled` ใน `useUpdateProduct` จะสั่ง refetch ข้อมูลใหม่โดยอัตโนมัติ
      })
      .catch((error) => {
        console.error("เกิดข้อผิดพลาดระหว่างการอัปเดตสต็อก:", error);
        confirmation.showConfirmation({
          title: "เกิดข้อผิดพลาด",
          message: "ไม่สามารถอัปเดตสต็อกสินค้าได้ กรุณาตรวจสอบและแก้ไขด้วยตนเอง",
          type: "error",
          confirmText: "ตกลง",
          showCancel: false,
        });
      });
  };

  const handleFinishTransaction = () => {
    // แค่ล้าง State ของ UI เท่านั้น ไม่ต้องยุ่งกับสต็อกอีกต่อไป
    setSelectedProducts(new Map());
    setAppliedDiscounts([]);
    setCurrentCustomer(null);
    handleClosePaymentModal();
  };

  const handleClosePaymentModal = () => setPaymentModalInfo({ isOpen: false, mode: "retail" });

  const handleOpenRetailPayment = () => {
    if (selectedProducts.size > 0) {
      setPaymentModalInfo({ isOpen: true, mode: "retail" });
    } else {
      confirmation.showConfirmation({
        title: "ไม่สามารถชำระเงินได้",
        message: "กรุณาเพิ่มสินค้าก่อนชำระเงิน",
        type: "warning",
        confirmText: "ตกลง",
        showCancel: false,
      });
    }
  };

  const handleOpenCompanyPayment = () => setPaymentModalInfo({ isOpen: true, mode: "record-income" });

  const priceAdjustmentDiscounts = useMemo(() => {
    const adjustments: Discount[] = [];
    for (const group of selectedProducts.values()) {
      const originalProduct = productsMap.get(group.productId);
      if (!originalProduct) continue;

      group.items.forEach((item) => {
        const priceDifference = originalProduct.price - item.unitPrice;
        if (priceDifference > 0) {
          adjustments.push({
            id: `adj-${item.uniqueId}`,
            name: `ส่วนลด ${item.name}`,
            type: "fixed",
            value: priceDifference,
          });
        }
      });
    }
    return adjustments;
  }, [selectedProducts, productsMap]);

  const allDiscounts = useMemo(
    () => [...appliedDiscounts, ...priceAdjustmentDiscounts],
    [appliedDiscounts, priceAdjustmentDiscounts],
  );

  const { subtotal, total, allCartItemsForSummary } = useMemo(() => {
    const allItems: SubItem[] = Array.from(selectedProducts.values()).flatMap((group) => group.items);
    const sub = allItems.reduce((sum, item) => {
      const originalPrice = productsMap.get(item.productId)?.price ?? item.unitPrice;
      return sum + originalPrice;
    }, 0);

    let discountAmount = 0;
    allDiscounts.forEach((d) => {
      discountAmount += d.type === "percentage" ? sub * (d.value / 100) : d.value;
    });
    const finalTotal = Math.max(0, sub - discountAmount);

    const summaryItems: SelectedItem[] = Array.from(selectedProducts.values()).map((group) => {
      const originalProduct = productsMap.get(group.productId);
      const originalPrice = originalProduct?.price ?? 0;
      return {
        id: group.productId,
        name: group.name,
        quantity: group.items.length,
        price: group.items[0]?.unitPrice ?? originalPrice,
        originalPrice: originalPrice,
      };
    });

    return { subtotal: sub, total: finalTotal, allCartItemsForSummary: summaryItems };
  }, [selectedProducts, allDiscounts, productsMap]);

  const handlePrintShortReceipt = () => setIsSummaryModalOpen(true);
  const handlePrintFullReceipt = () => setIsSummaryModalOpen(true);

  const handleSendEReceipt = () => {
    if (currentCustomer) {
      confirmation.showConfirmation({
        title: "ส่ง E-Receipt",
        message: `ส่ง E-Receipt ไปยัง: ${currentCustomer.name}\n(ฟีเจอร์นี้ยังอยู่ในขั้นตอนพัฒนา)`,
        type: "info",
        confirmText: "ตกลง",
        showCancel: false,
      });
    } else {
      confirmation.showConfirmation({
        title: "ไม่พบข้อมูลลูกค้า",
        message: "กรุณาเลือกลูกค้าก่อนส่ง E-Receipt",
        type: "warning",
        confirmText: "ตกลง",
        showCancel: false,
      });
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsCustomerModalOpen(false);
  };

  const handleAddNewCustomer = (newCustomer: Customer) => {
    setCustomers((prevCustomers) => [newCustomer, ...prevCustomers]);
    setCurrentCustomer(newCustomer);
    setIsCustomerModalOpen(false);
  };

  return (
    <div id="pos-page-container" className="flex h-screen flex-col bg-gray-900 dark:bg-black">
      {/* Screen: Lock Screen */}
      <POSLockScreen isLocked={isLockedScreen} onUnlock={handleUnlockScreen} correctPin={POS_PIN} />

      {/* Header: Top Bar */}
      <div className="flex w-full shrink-0 items-center gap-2 bg-gray-900 p-2 pt-4">
        <Button onClick={() => router.replace("/")} className="shrink-0">
          <FaArrowLeftLong />
          <span className="ml-2 hidden sm:inline">กลับสู่หน้า CP</span>
        </Button>

        <div className="flex h-full flex-1 items-center justify-end gap-1 sm:gap-2">
          {/* Section: Operation Mode Toggle */}
          <div className="flex h-full items-center gap-0.5 rounded-xl bg-gray-800 p-0.5 sm:gap-1 sm:p-1">
            {operationModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActivePosOperationMode(mode.id as PosOperationMode)}
                className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors duration-200 sm:px-4 sm:py-1.5 sm:text-sm ${
                  activePosOperationMode === mode.id
                    ? "bg-blue-500 text-white shadow"
                    : "text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <span className="hidden sm:inline">{mode.label}</span>
                <span className="sm:hidden">
                  {mode.id === "sell" ? "ขาย" : mode.id === "consignment" ? "ฝาก" : "ซ่อม"}
                </span>
              </button>
            ))}
          </div>
          {/* Section: Seller Profile */}
          <SellerProfile currentSeller={currentIssuer} allStaff={MOCK_STAFF} onSellerChange={setCurrentIssuer} />
        </div>
      </div>

      {/* Content: Main Content Area */}
      <div className="flex flex-1 overflow-hidden pb-16 md:pb-0">
        <div
          id="pos-page-grid"
          className="flex h-full flex-1 flex-col gap-2 overflow-y-auto p-2 md:grid md:grid-cols-24 md:overflow-hidden"
        >
          {/* Section: Product Catalog */}
          <div
            id="pos-selling-details-section"
            className="no-scrollbar order-1 shrink-0 overflow-y-auto rounded-lg md:order-none md:col-span-12 md:shrink lg:col-span-16"
          >
            {/* MARK: - ProductCategory will handle data fetching internally */}
            <SellingDetails onAddProduct={addProductToCart} availableStock={availableStock} />
          </div>
          {/* Section: Cart and Actions */}
          <div
            id="pos-selling-action-section"
            className="order-2 flex w-full shrink-0 flex-col gap-2 overflow-hidden md:order-none md:col-span-12 md:flex-1 md:shrink lg:col-span-8"
          >
            <SellingAction
              selectedProductsMap={selectedProducts}
              updateCart={updateCart}
              currentCustomer={currentCustomer}
              appliedDiscounts={appliedDiscounts}
              priceAdjustmentDiscounts={priceAdjustmentDiscounts}
              onDiscountsChange={setAppliedDiscounts}
              onOpenRetailPayment={handleOpenRetailPayment}
              productsMap={productsMap}
            />
          </div>
        </div>

        {/* Sidebar: Desktop Sidebar Menu */}
        <div className="hidden md:block">
          <SidebarMenu
            onCustomerSelect={setCurrentCustomer}
            currentCustomer={currentCustomer}
            appliedDiscounts={appliedDiscounts}
            onDiscountsChange={setAppliedDiscounts}
            onCashDrawerActivity={handleCashDrawerActivity}
            onLockScreen={() => setIsLockedScreen(true)}
            onOpenCompanyPayment={handleOpenCompanyPayment}
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onOpenSummaryModal={() => setIsSummaryModalOpen(true)}
            onClearCart={() => {
              confirmation.showConfirmation({
                title: "ล้างข้อมูลการขาย",
                message: "คุณต้องการล้างข้อมูลการขายทั้งหมดหรือไม่? (สินค้า, ลูกค้า, ส่วนลด)",
                type: "warning",
                confirmText: "ยืนยัน",
                cancelText: "ยกเลิก",
                showCancel: true,
                onConfirm: () => {
                  setSelectedProducts(new Map());
                  setCurrentCustomer(null);
                  setAppliedDiscounts([]);
                },
              });
            }}
          />
        </div>
      </div>

      {/* Modal: Payment */}
      <PaymentModal
        isOpen={paymentModalInfo.isOpen}
        mode={paymentModalInfo.mode}
        onClose={handleClosePaymentModal}
        totalToPay={total}
        onPaymentSuccess={handlePaymentSuccess}
        onFinishTransaction={handleFinishTransaction}
        onPrintShortReceipt={handlePrintShortReceipt}
        onPrintFullReceipt={handlePrintFullReceipt}
        onSendEReceipt={handleSendEReceipt}
        vatMode={vatMode}
        setVatMode={setVatMode}
        withholdingTaxPercent={withholdingTaxPercent}
        setWithholdingTaxPercent={setWithholdingTaxPercent}
        withholdingTaxVatMode={withholdingTaxVatMode}
        setWithholdingTaxVatMode={setWithholdingTaxVatMode}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isTaxInvoice={isTaxInvoice}
        setIsTaxInvoice={setIsTaxInvoice}
      />

      {/* Modal: Summary/Receipt */}
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onOpenCustomerSearch={() => setIsCustomerModalOpen(true)}
        items={allCartItemsForSummary}
        customer={currentCustomer}
        subtotal={subtotal}
        total={total}
        billIssuers={MOCK_STAFF}
        currentIssuer={currentIssuer}
        discounts={allDiscounts}
        vatMode={vatMode}
        setVatMode={setVatMode}
        withholdingTaxPercent={withholdingTaxPercent}
        setWithholdingTaxPercent={setWithholdingTaxPercent}
        withholdingTaxVatMode={withholdingTaxVatMode}
        setWithholdingTaxVatMode={setWithholdingTaxVatMode}
        paymentMethod={paymentMethod}
        isTaxInvoice={isTaxInvoice}
        setIsTaxInvoice={setIsTaxInvoice}
      />

      {/* Modal: Customer Selection */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={handleCustomerSelect}
        customers={customers}
        onAddNewCustomer={handleAddNewCustomer}
      />

      {/* Modal: Confirmation Dialog */}
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

      {/* Modal: Discount */}
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        initialDiscounts={appliedDiscounts}
        onApplyDiscounts={setAppliedDiscounts}
      />

      {/* Modal: Cash Drawer */}
      <CashDrawerModal
        isOpen={isCashDrawerModalOpen}
        onClose={() => setIsCashDrawerModalOpen(false)}
        onConfirm={handleCashDrawerActivity}
      />

      {/* Footer: Mobile Action Buttons */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-700 bg-gray-900 md:hidden">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-lg px-1 py-2 transition-colors hover:bg-gray-800"
          >
            <FaUser size={20} className="mb-1 text-white" />
            <span className="text-[10px] text-white">สมาชิก</span>
          </button>
          <button
            onClick={() => setIsDiscountModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-lg px-1 py-2 transition-colors hover:bg-gray-800"
          >
            <FaTag size={20} className="mb-1 text-white" />
            <span className="text-[10px] text-white">ส่วนลด</span>
          </button>
          <button
            onClick={() => setIsCashDrawerModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-lg px-1 py-2 transition-colors hover:bg-gray-800"
          >
            <FaCashRegister size={20} className="mb-1 text-white" />
            <span className="text-[10px] text-white">ลิ้นชัก</span>
          </button>
          <button
            onClick={() => setIsSummaryModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-lg px-1 py-2 transition-colors hover:bg-gray-800"
          >
            <FaPrint size={20} className="mb-1 text-white" />
            <span className="text-[10px] text-white">พิมพ์</span>
          </button>
          <button
            onClick={handleOpenRetailPayment}
            className="flex flex-col items-center justify-center rounded-lg bg-blue-600 px-1 py-2 transition-colors hover:bg-blue-700"
          >
            <FaBoxArchive size={20} className="mb-1 text-white" />
            <span className="text-[10px] font-semibold text-white">ชำระ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
