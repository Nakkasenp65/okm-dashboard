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
import { Customer } from "./components/(modal)/CustomerModal";
import { Discount } from "./components/(modal)/DiscountModal";
import { CashDrawerActivity } from "./components/(modal)/CashDrawerModal";
import { StaffMember } from "./components/(modal)/SummaryModal";
import { Payment } from "./components/(modal)/PaymentModal";

// --- TYPE DEFINITIONS ---

// Type สำหรับบันทึกธุรกรรมลิ้นชัก
export interface CashDrawerTransaction extends CashDrawerActivity {
  id: string;
  timestamp: Date;
}

// Type สำหรับสินค้าแต่ละชิ้น (Sub-item) ในตะกร้า
export interface SubItem {
  uniqueId: string;
  productId: number;
  name: string;
  unitPrice: number;
}

// Type สำหรับสินค้าที่ถูกจัดกลุ่มในตะกร้า
export interface GroupedProduct {
  productId: number;
  name: string;
  items: SubItem[];
}

// Type สำหรับข้อมูลสรุปที่ส่งให้ SummaryModal
export interface SelectedItem {
  id: number;
  name: string;
  qty: number;
  unitPrice: number;
}

// --- MOCK DATA ---
const MOCK_STAFF: StaffMember[] = [
  { id: 1, name: "Noppadol Lerptakool" },
  { id: 2, name: "Weerapong Ponsena" },
  { id: 3, name: "Admin (ผู้ดูแลระบบ)" },
];

// --- MAIN PAGE COMPONENT ---
export default function Page() {
  // --- STATE MANAGEMENT ---

  // State หลักของตะกร้าสินค้าเป็น Map
  const [selectedProducts, setSelectedProducts] = useState<
    Map<number, GroupedProduct>
  >(new Map());

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState<Discount[]>([]);
  const [, setCashDrawerTransactions] = useState<CashDrawerTransaction[]>([]);
  const [currentIssuer] = useState<StaffMember>(MOCK_STAFF[0]);

  // Lock Screen State
  const [isLockedScreen, setIsLockedScreen] = useState(true);
  const POS_PIN = "1234";

  const handleUnlockScreen = (pin: string) => {
    if (pin === POS_PIN) {
      setIsLockedScreen(false);
      console.log("✅ POS ปลดล็อคสำเร็จ");
    }
  };

  const router = useRouter();

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // ในระบบจริง ส่วนนี้จะ fetch จาก API
        const apiResponse = await import("./mockData.json");
        const rawProducts = apiResponse.default.data.tbody;
        const transformedProducts = transformApiDataToProducts(rawProducts);
        setAllProducts(transformedProducts);
      } catch (err) {
        console.error("Failed to load or transform product data:", err);
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- EVENT HANDLERS ---

  // ฟังก์ชันเพิ่มสินค้า (Immutable)
  const addProductToCart = useCallback((productToAdd: Product) => {
    setSelectedProducts((prevMap) => {
      const newMap = new Map(prevMap);
      const existingGroup = newMap.get(productToAdd.id);

      const newSubItem: SubItem = {
        uniqueId: `${productToAdd.id}-${Date.now()}-${Math.random()}`,
        productId: productToAdd.id,
        name: productToAdd.name,
        unitPrice: productToAdd.price,
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

  // ฟังก์ชันอัปเดตตะกร้าจาก Component ลูก
  const updateCart = (productId: number, updatedItems: SubItem[]) => {
    setSelectedProducts((prevMap) => {
      const newMap = new Map(prevMap);
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
    console.log("การชำระเงินสำเร็จ:", { payments, change });
    // Logic for saving the transaction
    setSelectedProducts(new Map());
    setAppliedDiscounts([]);
    setCurrentCustomer(null);
  };

  // --- DERIVED STATE & CALCULATIONS using useMemo for performance ---
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

    // แปลงข้อมูลจาก Map ไปเป็น Array รูปแบบ SelectedItem สำหรับส่งให้ Modal
    const summaryItems: SelectedItem[] = Array.from(
      selectedProducts.values(),
    ).map((group) => {
      const groupTotal = group.items.reduce(
        (sum, item) => sum + item.unitPrice,
        0,
      );
      return {
        id: group.productId,
        name: group.name,
        qty: group.items.length,
        unitPrice: group.items.length > 0 ? groupTotal / group.items.length : 0, // ราคาเฉลี่ย
      };
    });

    return {
      subtotal: sub,
      total: finalTotal,
      allCartItemsForSummary: summaryItems,
    };
  }, [selectedProducts, appliedDiscounts]);

  return (
    <div
      id="pos-page-container"
      className="flex h-screen flex-col bg-gray-900 dark:bg-black"
    >
      {/* Lock Screen Overlay */}
      <POSLockScreen
        isLocked={isLockedScreen}
        onUnlock={handleUnlockScreen}
        correctPin={POS_PIN}
      />

      <div className="w-full shrink-0 bg-gray-900 p-2">
        <Button onClick={() => router.back()}>
          <FaArrowLeftLong />
          ย้อนกลับไป CP
        </Button>
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
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
        <SidebarMenu
          selectedProducts={allCartItemsForSummary}
          setSelectedProducts={() => setSelectedProducts(new Map())}
          onCustomerSelect={setCurrentCustomer}
          currentCustomer={currentCustomer}
          appliedDiscounts={appliedDiscounts}
          onDiscountsChange={setAppliedDiscounts}
          onCashDrawerActivity={handleCashDrawerActivity}
          onLockScreen={() => setIsLockedScreen(true)}
          subtotal={subtotal}
          total={total}
          billIssuers={MOCK_STAFF}
          currentIssuer={currentIssuer}
        />
      </div>
    </div>
  );
}
