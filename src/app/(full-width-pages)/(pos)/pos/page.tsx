"use client";
import { FaArrowLeftLong } from "react-icons/fa6";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../../components/ui/button/Button";
import SellingDetails from "./components/SellingDetails";
import SellingAction from "./components/SellingAction";
import SidebarMenu from "./components/SidebarMenu";
import POSLockScreen from "./components/(modal)/POSLockScreenModal";
import CustomerModal from "./components/(modal)/CustomerModal";
import PaymentModal, {
  Payment,
  PaymentMethod,
} from "./components/(modal)/PaymentModal";
import CashDrawerModal, {
  CashDrawerActivity,
} from "./components/(modal)/CashDrawerModal";
import SummaryModal from "./components/(modal)/SummaryModal";
import DiscountModal from "./components/(modal)/DiscountModal";
import ConfirmationModal from "./components/(modal)/ConfirmationModal";
import { useConfirmation } from "./hooks/useConfirmation";
import { usePosMockData } from "./components/usePosMockData";
import SellerProfile from "./components/SellerProfile";
import {
  FaUser,
  FaTag,
  FaCashRegister,
  FaBoxArchive,
  FaPrint,
} from "react-icons/fa6";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Customer, Product, StaffMember, Discount } from "./types/Pos";
import { VatCalculationMode } from "./types/Receipt";

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

const operationModes = [
  { id: "sell", label: "ขายซื้อ" },
  { id: "consignment", label: "ขายฝาก" },
  { id: "repair", label: "ซ่อม" },
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
  {
    id: "3",
    name: "ประเสริฐ รุ่งเรือง",
    level: "Gold",
    phone: "083-456-7890",
    memberId: "OKM003",
    emoji: "🥇",
    color: "from-yellow-400 to-amber-600",
    age: 51,
    citizenId: "3456789012345",
    address: "789 ถนนพระราม 4 แขวงตึกแกน เขตสวนหลวง กรุงเทพฯ 10100",
    customerPoint: 4500,
  },
  {
    id: "4",
    name: "มานี รักไทย",
    level: "Silver",
    phone: "084-567-8901",
    memberId: "OKM004",
    emoji: "🥈",
    color: "from-gray-300 to-slate-500",
    age: 28,
    citizenId: "4567890123456",
    address: "321 ถนนสุขุมวิท แขวงนานา เขตเขตคลองเตย กรุงเทพฯ 10110",
    customerPoint: 1200,
  },
  {
    id: "5",
    name: "ลูกค้าทั่วไป",
    level: "ทั่วไป",
    phone: "-",
    memberId: "N/A",
    emoji: "👤",
    color: "from-gray-400 to-gray-600",
    customerPoint: 0,
  },
  {
    id: "6",
    name: "วิชัย เก่งกาจ",
    level: "Gold",
    phone: "086-789-0123",
    memberId: "OKM006",
    emoji: "🥇",
    color: "from-yellow-400 to-amber-600",
    age: 42,
    citizenId: "5678901234567",
    address: "654 ถนนวิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330",
    customerPoint: 5150,
  },
  {
    id: "7",
    name: "อารี ยิ้มแย้ม",
    level: "Platinum",
    phone: "087-890-1234",
    memberId: "OKM007",
    emoji: "💎",
    color: "from-cyan-400 to-blue-600",
    age: 35,
    citizenId: "6789012345678",
    address: "987 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
    customerPoint: 9870,
  },
];

export default function Page() {
  const {
    products: allProducts,
    initialStock,
    loading: isLoading,
    error,
  } = usePosMockData();

  const productsMap = useMemo(() => {
    const map = new Map<number, Product>();
    allProducts.forEach((product) => {
      map.set(product.id, product);
    });
    return map;
  }, [allProducts]);

  const [currentStock, setCurrentStock] = useState<Map<number, number>>(
    new Map(),
  );

  const [selectedProducts, setSelectedProducts] = useState<
    Map<number, GroupedProduct>
  >(new Map());
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState<Discount[]>([]);
  const [, setCashDrawerTransactions] = useState<CashDrawerTransaction[]>([]);
  const [currentIssuer, setCurrentIssuer] = useState<StaffMember>(
    MOCK_STAFF[0],
  );
  const [activePosOperationMode, setActivePosOperationMode] =
    useState<PosOperationMode>("sell");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const [vatMode, setVatModeState] = useState<VatCalculationMode>("off");
  const setVatMode = useCallback((mode: VatCalculationMode) => {
    setVatModeState(mode);
  }, []);

  const [withholdingTaxPercent, setWithholdingTaxPercentState] =
    useState<number>(0);

  const setWithholdingTaxPercent = useCallback((percent: number) => {
    setWithholdingTaxPercentState(percent);
  }, []);

  const [withholdingTaxVatMode, setWithholdingTaxVatModeState] = useState<
    "pre-vat" | "post-vat"
  >("pre-vat");
  const setWithholdingTaxVatMode = useCallback(
    (mode: "pre-vat" | "post-vat") => {
      setWithholdingTaxVatModeState(mode);
    },
    [],
  );

  // ✅ KEY CHANGE: State for controlling tax invoice mode, shared between modals.
  const [isTaxInvoice, setIsTaxInvoice] = useState<boolean>(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCashDrawerModalOpen, setIsCashDrawerModalOpen] = useState(false);
  const confirmation = useConfirmation();
  const [paymentModalInfo, setPaymentModalInfo] = useState<{
    isOpen: boolean;
    mode: PosMode;
  }>({ isOpen: false, mode: "retail" });
  const [isLockedScreen, setIsLockedScreen] = useState(true);
  const POS_PIN = "1234";
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && initialStock.size > 0) {
      setCurrentStock(new Map(initialStock));
    }
  }, [isLoading, initialStock]);

  const handleUnlockScreen = (pin: string) => {
    if (pin === POS_PIN) {
      setIsLockedScreen(false);
    }
  };

  const addProductToCart = useCallback((productToAdd: Product) => {
    setCurrentStock((prevStock) => {
      const newStock = new Map(prevStock);
      const stock = newStock.get(productToAdd.id) || 0;
      if (stock > 0) {
        newStock.set(productToAdd.id, stock - 1);
      }
      return newStock;
    });

    setSelectedProducts((prevMap) => {
      const newMap = new Map(prevMap);
      const existingGroup = newMap.get(productToAdd.id);
      const imei = `IMEI${productToAdd.id}${Date.now().toString().slice(-6)}`;
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
  }, []);

  const updateCart = (productId: number, updatedItems: SubItem[]) => {
    setSelectedProducts((prevMap) => {
      const newMap = new Map(prevMap);
      const oldGroup = newMap.get(productId);
      const oldItemCount = oldGroup?.items.length || 0;
      const newItemCount = updatedItems.length;
      const difference = oldItemCount - newItemCount;

      if (updatedItems.length === 0) {
        newMap.delete(productId);
      } else {
        const group = newMap.get(productId);
        if (group) {
          const updatedGroup: GroupedProduct = {
            ...group,
            items: updatedItems,
          };
          newMap.set(productId, updatedGroup);
        }
      }

      if (difference > 0) {
        setCurrentStock((prevStock) => {
          const newStock = new Map(prevStock);
          const stock = newStock.get(productId) || 0;
          newStock.set(productId, stock + difference);
          return newStock;
        });
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
    console.log("Transaction successful, state preserved for printing:", {
      payments,
      change,
    });
  };

  const handleFinishTransaction = () => {
    setSelectedProducts(new Map());
    setAppliedDiscounts([]);
    setCurrentCustomer(null);
    handleClosePaymentModal();
    setCurrentStock(new Map(initialStock));
  };

  const handleClosePaymentModal = () => {
    setPaymentModalInfo({ isOpen: false, mode: "retail" });
  };

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

  const handleOpenCompanyPayment = () => {
    setPaymentModalInfo({ isOpen: true, mode: "record-income" });
  };

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

  const allDiscounts = useMemo(() => {
    return [...appliedDiscounts, ...priceAdjustmentDiscounts];
  }, [appliedDiscounts, priceAdjustmentDiscounts]);

  const { subtotal, total, allCartItemsForSummary } = useMemo(() => {
    const allItems: SubItem[] = Array.from(selectedProducts.values()).flatMap(
      (group) => group.items,
    );
    const sub = allItems.reduce((sum, item) => {
      const originalPrice =
        productsMap.get(item.productId)?.price ?? item.unitPrice;
      return sum + originalPrice;
    }, 0);

    let discountAmount = 0;
    allDiscounts.forEach((d) => {
      discountAmount +=
        d.type === "percentage" ? sub * (d.value / 100) : d.value;
    });
    const finalTotal = Math.max(0, sub - discountAmount);

    const summaryItems: SelectedItem[] = Array.from(
      selectedProducts.values(),
    ).map((group) => {
      const originalProduct = productsMap.get(group.productId);
      const originalPrice = originalProduct?.price ?? 0;
      const quantity = group.items.length;
      return {
        id: group.productId,
        name: group.name,
        quantity: quantity,
        price: group.items[0]?.unitPrice ?? originalPrice,
        originalPrice: originalPrice,
      };
    });

    return {
      subtotal: sub,
      total: finalTotal,
      allCartItemsForSummary: summaryItems,
    };
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

  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div
        id="pos-page-container"
        className="flex h-screen flex-col bg-gray-900 dark:bg-black"
      >
        <POSLockScreen
          isLocked={isLockedScreen}
          onUnlock={handleUnlockScreen}
          correctPin={POS_PIN}
        />

        <div className="flex w-full shrink-0 items-center gap-2 bg-gray-900 p-2 pt-4">
          <Button onClick={() => router.replace("/")} className="shrink-0">
            <FaArrowLeftLong />
            <span className="ml-2 hidden sm:inline">กลับสู่หน้า CP</span>
          </Button>

          <div className="flex h-full flex-1 items-center justify-end gap-1 sm:gap-2">
            <div className="flex h-full items-center gap-0.5 rounded-xl bg-gray-800 p-0.5 sm:gap-1 sm:p-1">
              {operationModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() =>
                    setActivePosOperationMode(mode.id as PosOperationMode)
                  }
                  className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors duration-200 sm:px-4 sm:py-1.5 sm:text-sm ${
                    activePosOperationMode === mode.id
                      ? "bg-blue-500 text-white shadow"
                      : "text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  <span className="hidden sm:inline">{mode.label}</span>
                  <span className="sm:hidden">
                    {mode.id === "sell"
                      ? "ขาย"
                      : mode.id === "consignment"
                        ? "ฝาก"
                        : "ซ่อม"}
                  </span>
                </button>
              ))}
            </div>

            <SellerProfile
              currentSeller={currentIssuer}
              allStaff={MOCK_STAFF}
              onSellerChange={setCurrentIssuer}
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden pb-16 md:pb-0">
          <div
            id="pos-page-grid"
            className="flex h-full flex-1 flex-col gap-2 overflow-y-auto p-2 md:grid md:grid-cols-24 md:overflow-hidden"
          >
            <div
              id="pos-selling-details-section"
              className="no-scrollbar order-1 shrink-0 overflow-y-auto rounded-lg md:order-none md:col-span-12 md:shrink lg:col-span-16"
            >
              <SellingDetails
                onAddProduct={addProductToCart}
                availableProducts={allProducts}
                availableStock={currentStock}
                isLoading={isLoading}
                error={error}
              />
            </div>
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
                  message:
                    "คุณต้องการล้างข้อมูลการขายทั้งหมดหรือไม่? (สินค้า, ลูกค้า, ส่วนลด)",
                  type: "warning",
                  confirmText: "ยืนยัน",
                  cancelText: "ยกเลิก",
                  showCancel: true,
                  onConfirm: () => {
                    setSelectedProducts(new Map());
                    setCurrentCustomer(null);
                    setAppliedDiscounts([]);
                    setCurrentStock(new Map(initialStock));
                  },
                });
              }}
            />
          </div>
        </div>

        {/* ✅ KEY CHANGE: Pass isTaxInvoice state and setter to PaymentModal */}
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

        {/* ✅ KEY CHANGE: Pass isTaxInvoice state and setter to SummaryModal */}
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

        <CustomerModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSelectCustomer={handleCustomerSelect}
          customers={customers}
          onAddNewCustomer={handleAddNewCustomer}
        />

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

        <DiscountModal
          isOpen={isDiscountModalOpen}
          onClose={() => setIsDiscountModalOpen(false)}
          initialDiscounts={appliedDiscounts}
          onApplyDiscounts={setAppliedDiscounts}
        />

        <CashDrawerModal
          isOpen={isCashDrawerModalOpen}
          onClose={() => setIsCashDrawerModalOpen(false)}
          onConfirm={handleCashDrawerActivity}
        />

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
    </QueryClientProvider>
  );
}
