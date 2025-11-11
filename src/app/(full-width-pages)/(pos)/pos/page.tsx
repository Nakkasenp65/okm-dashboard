"use client";
import SellingDetails from "./components/SellingDetails";
import SellingAction from "./components/SellingAction";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Button from "../../../../components/ui/button/Button";
import { FaArrowLeftLong } from "react-icons/fa6";
import SidebarMenu from "./components/SidebarMenu";
import POSLockScreen from "./components/(modal)/POSLockScreenModal";
import { useRouter } from "next/navigation";
import {
  Product,
  transformApiDataToProducts,
} from "./components/dataTransformer";
import CustomerModal, { Customer } from "./components/(modal)/CustomerModal";
import { Discount } from "./components/(modal)/DiscountModal";
import { CashDrawerActivity } from "./components/(modal)/CashDrawerModal";
import { StaffMember } from "./components/(receipt)/receiptTypes";
import PaymentModal, { Payment } from "./components/(modal)/PaymentModal";
import SummaryModal from "./components/(modal)/SummaryModal";
import ConfirmationModal from "./components/(modal)/ConfirmationModal";
import { useConfirmation } from "./hooks/useConfirmation";

export interface CashDrawerTransaction extends CashDrawerActivity {
  id: string;
  timestamp: Date;
}

export interface SubItem {
  uniqueId: string;
  productId: number;
  name: string;
  unitPrice: number;
  imei?: string; // IMEI/Serial Number
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
  const [selectedProducts, setSelectedProducts] = useState<
    Map<number, GroupedProduct>
  >(new Map());
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [availableStock, setAvailableStock] = useState<Map<number, number>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState<Discount[]>([]);
  const [, setCashDrawerTransactions] = useState<CashDrawerTransaction[]>([]);
  const [currentIssuer] = useState<StaffMember>(MOCK_STAFF[0]);
  const [activePosOperationMode, setActivePosOperationMode] =
    useState<PosOperationMode>("sell");

  // --- Centralized Modal State ---
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const confirmation = useConfirmation();

  const [paymentModalInfo, setPaymentModalInfo] = useState<{
    isOpen: boolean;
    mode: PosMode;
  }>({ isOpen: false, mode: "retail" });

  const [isLockedScreen, setIsLockedScreen] = useState(true);
  const POS_PIN = "1234";

  const handleUnlockScreen = (pin: string) => {
    if (pin === POS_PIN) {
      setIsLockedScreen(false);
      console.log("✅ POS unlocked successfully");
    }
  };

  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiResponse = await import("./mockData.json");
        const rawProducts = apiResponse.default.data.tbody;
        const transformedProducts = transformApiDataToProducts(rawProducts);
        setAllProducts(transformedProducts);

        // Initialize available stock
        const stockMap = new Map<number, number>();
        transformedProducts.forEach((product) => {
          stockMap.set(product.id, product.stock);
        });
        setAvailableStock(stockMap);
      } catch (err) {
        console.error("Failed to load or transform product data:", err);
        setError("Could not load product data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addProductToCart = useCallback((productToAdd: Product) => {
    setSelectedProducts((prevMap) => {
      const newMap = new Map(prevMap);
      const existingGroup = newMap.get(productToAdd.id);

      // Generate IMEI/SN (mock)
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

    // Decrease available stock
    setAvailableStock((prev) => {
      const newStock = new Map(prev);
      const currentStock = newStock.get(productToAdd.id) || 0;
      if (currentStock > 0) {
        newStock.set(productToAdd.id, currentStock - 1);
      }
      return newStock;
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

      // Restore stock for removed items
      if (difference > 0) {
        setAvailableStock((prev) => {
          const newStock = new Map(prev);
          const currentStock = newStock.get(productId) || 0;
          newStock.set(productId, currentStock + difference);
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
    console.log("Finishing transaction and clearing state.");
    setSelectedProducts(new Map());
    setAppliedDiscounts([]);
    setCurrentCustomer(null);
    handleClosePaymentModal();
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

  const handlePrintShortReceipt = () => {
    setIsSummaryModalOpen(true);
  };

  const handlePrintFullReceipt = () => {
    setIsSummaryModalOpen(true);
  };

  const handleSendEReceipt = () => {
    console.log("📧 Sending E-Receipt...");
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
    setIsCustomerModalOpen(false); // Close only the customer modal
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

      <div className="flex w-full shrink-0 items-center bg-gray-900 p-2 pt-4">
        <Button onClick={() => router.replace("/")}>
          <FaArrowLeftLong />
          กลับสู่หน้า CP
        </Button>

        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1">
            {operationModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() =>
                  setActivePosOperationMode(mode.id as PosOperationMode)
                }
                className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                  activePosOperationMode === mode.id
                    ? "bg-blue-500 text-white shadow"
                    : "text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          id="pos-page-grid"
          className="grid h-full flex-1 grid-cols-24 gap-2 p-2"
        >
          <div
            id="pos-selling-details-section"
            className="no-scrollbar col-span-12 overflow-y-auto rounded-lg lg:col-span-16"
          >
            <SellingDetails
              onAddProduct={addProductToCart}
              availableProducts={allProducts}
              availableStock={availableStock}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <div
            id="pos-selling-action-section"
            className="col-span-12 flex w-full flex-col gap-2 overflow-hidden lg:col-span-8"
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
              },
            });
          }}
        />
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
    </div>
  );
}
