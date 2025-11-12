"use client";
import { FaArrowLeftLong } from "react-icons/fa6";
import React, { useState, useMemo, useCallback, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";
import Button from "../../../../components/ui/button/Button";
import SellingDetails from "./components/SellingDetails";
import SellingAction from "./components/SellingAction";
import SidebarMenu from "./components/SidebarMenu";
import POSLockScreen from "./components/(modal)/POSLockScreenModal";
import CustomerModal, { Customer } from "./components/(modal)/CustomerModal";
import PaymentModal, { Payment } from "./components/(modal)/PaymentModal";
import { StaffMember } from "./components/(receipt)/receiptTypes";
import CashDrawerModal, {
  CashDrawerActivity,
} from "./components/(modal)/CashDrawerModal";
import SummaryModal from "./components/(modal)/SummaryModal";
import DiscountModal, { Discount } from "./components/(modal)/DiscountModal";
import ConfirmationModal from "./components/(modal)/ConfirmationModal";
import { Product } from "./components/dataTransformer";
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

// ✅ เพิ่ม VatCalculationMode type
export type VatCalculationMode = "off" | "included" | "excluded";

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

export default function Page() {
  const {
    products: allProducts,
    initialStock,
    loading: isLoading,
    error,
  } = usePosMockData();

  const [currentStock, setCurrentStock] = useState<Map<number, number>>(
    new Map(),
  );

  const [selectedProducts, setSelectedProducts] = useState<
    Map<number, GroupedProduct>
  >(new Map());
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState<Discount[]>([]);
  const [, setCashDrawerTransactions] = useState<CashDrawerTransaction[]>([]);
  const [currentIssuer, setCurrentIssuer] = useState<StaffMember>(
    MOCK_STAFF[0],
  );
  const [activePosOperationMode, setActivePosOperationMode] =
    useState<PosOperationMode>("sell");

  // ✅ ภาษีมูลค่าเพิ่ม
  const [vatMode, setVatModeState] = useState<VatCalculationMode>("off");
  const setVatMode = useCallback((mode: VatCalculationMode) => {
    setVatModeState(mode);
  }, []);

  // ✅ ภาษี ณ ที่จ่าย
  const [withholdingTaxPercent, setWithholdingTaxPercentState] =
    useState<number>(0);

  const setWithholdingTaxPercent = useCallback((percent: number) => {
    setWithholdingTaxPercentState(percent);
  }, []);

  // ✅ โหมดภาษี ณ ที่จ่าย
  const [withholdingTaxVatMode, setWithholdingTaxVatModeState] = useState<
    "pre-vat" | "post-vat"
  >("pre-vat");
  const setWithholdingTaxVatMode = useCallback(
    (mode: "pre-vat" | "post-vat") => {
      setWithholdingTaxVatModeState(mode);
    },
    [],
  );

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

  const addProductToCart = useCallback(
    (productToAdd: Product) => {
      // ✅ KEY CHANGE: อัปเดต currentStock โดยตรง
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
    },
    [], // ไม่ต้องมี dependency แล้ว เพราะเราใช้ functional update
  );

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

      // ✅ KEY CHANGE: อัปเดต currentStock เมื่อมีการคืนของ
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
    // ✅ KEY CHANGE: รีเซ็ต Stock กลับไปเป็นค่าเริ่มต้นหลังจบ Transaction
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

  const { subtotal, total, allCartItemsForSummary } = useMemo(() => {
    const allItems: SubItem[] = Array.from(selectedProducts.values()).flatMap(
      (group) => group.items,
    );
    const sub = allItems.reduce((sum, item) => sum + item.unitPrice, 0);
    let discountAmount = 0;
    appliedDiscounts.forEach((d) => {
      discountAmount +=
        d.type === "percentage" ? sub * (d.value / 100) : d.value;
    });
    const finalTotal = Math.max(0, sub - discountAmount);

    const summaryItems: SelectedItem[] = Array.from(
      selectedProducts.values(),
    ).map((group) => {
      const groupTotal = group.items.reduce(
        (sum, item) => sum + item.unitPrice,
        0,
      );
      const quantity = group.items.length;
      const price = quantity > 0 ? groupTotal / quantity : 0;
      return {
        id: group.productId,
        name: group.name,
        quantity: quantity,
        price: price,
      };
    });

    return {
      subtotal: sub,
      total: finalTotal,
      allCartItemsForSummary: summaryItems,
    };
  }, [selectedProducts, appliedDiscounts]);

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

  return (
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

          {/* Seller Profile */}
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
              onDiscountsChange={setAppliedDiscounts}
              onOpenRetailPayment={handleOpenRetailPayment}
            />
          </div>
        </div>

        {/* Desktop Sidebar - ซ่อนในมือถือ */}
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
                  // ✅ KEY CHANGE: รีเซ็ต Stock เมื่อล้างตะกร้า
                  setCurrentStock(new Map(initialStock));
                },
              });
            }}
          />
        </div>
      </div>

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
      />

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
        discounts={appliedDiscounts}
        vatMode={vatMode}
        setVatMode={setVatMode}
        withholdingTaxPercent={withholdingTaxPercent}
        setWithholdingTaxPercent={setWithholdingTaxPercent}
        withholdingTaxVatMode={withholdingTaxVatMode}
        setWithholdingTaxVatMode={setWithholdingTaxVatMode}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={handleCustomerSelect}
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

      {/* Mobile Bottom Navigation */}
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
