"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import ProductCategory from "./components/(product-catalog)/ProductCategory";
import SellingAction from "./components/(cart-action)/SellingAction";
import SidebarMenu from "./components/(sidebar)/SidebarMenu";
import FooterComponent from "./components/(footer)/FooterComponent";
import POSLockScreen from "./components/(modal)/POSLockScreenModal";
import CustomerModal from "./components/(modal)/CustomerModal";
import PaymentModal, { Payment, PaymentMethod } from "./components/(modal)/(payment)/PaymentModal";
import CashDrawerModal, { CashDrawerActivity } from "./components/(modal)/CashDrawerModal";
import SummaryModal from "./components/(modal)/SummaryModal";
import DiscountModal from "./components/(modal)/DiscountModal";
import ConfirmationModal from "./components/(modal)/ConfirmationModal";
import { useConfirmation } from "./hooks/useConfirmation";
import { Customer, Product, StaffMember, Discount } from "./types/Pos";
import { VatCalculationMode } from "./types/Receipt";
import { useProducts, useUpdateProduct } from "./hooks/useProduct";
import { useCart } from "./hooks/useCart";
import TopBarComponent from "./components/(top-bar)/TopBarComponent";
import { usePayment, PaymentMethodType } from "./hooks/usePayment";
import { useConfirmPayment, ConfirmPaymentPayload } from "./hooks/useConfirmPayment";

// MARK: - MOCK & Interfaces
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
  productData: Product; // Store full product data
  expiredAt?: string;
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
  {
    adminId: "682dbb68048a75e4ab7f0129",
    username: "rachen",
    fullName: "ราเชน สินสันเทียะ",
    staffId: "EMP001",
    roles: ["superultra_admin", "ENGINEER"],
    profile_image: "https://lh3.googleusercontent.com/d/1_sU6tJ_zpigSZGFSlGxyTkxacdT_tOWw",
  },
  {
    adminId: "mock_admin_2",
    username: "noppadol",
    fullName: "Noppadol Lerptakool",
    staffId: "OKM001",
    roles: ["admin", "SALES"],
    profile_image: "",
  },
  {
    adminId: "mock_admin_3",
    username: "weerapong",
    fullName: "Weerapong Ponsena",
    staffId: "OKM002",
    roles: ["admin", "SALES"],
    profile_image: "",
  },
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

const productQueryOptions = { limit: 100 };

export default function Page() {
  // Section: Data Fetching & Mutations
  const { data: productsData } = useProducts(productQueryOptions);
  
  const updateProductMutation = useUpdateProduct();

  // Section: Memoized Data Transformation
  const allProducts = useMemo(() => productsData?.products || [], [productsData]);
  const productsMap = useMemo(() => {
    const map = new Map<number, Product>();
    allProducts.forEach((product) => {
      map.set(product.id, product);
    });
    return map;
  }, [allProducts]);

  // Section: POS State Management
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState<Discount[]>([]);
  const [, setCashDrawerTransactions] = useState<CashDrawerTransaction[]>([]);
  const [currentIssuer, setCurrentIssuer] = useState<StaffMember>(MOCK_STAFF[0]);
  const [activePosOperationMode, setActivePosOperationMode] = useState<PosOperationMode>("sell");

  // MARK: - Hooks (Payment & Cart)
  const { 
    paymentSession, 
    isLoadingSession: isSessionLoading,
    addPaymentAsync, // API Call to save payment methods
    isAddingPayment, // Loading state
  } = usePayment(currentIssuer.staffId);
  
  const {
    cartItems,
    addToCart,
    removeFromCart,
    isLoading: isCartLoading,
    isAdding,
    addingProductId,
    isRemoving,
    renewCartItem,
    isRenewing,
    isUpdating,
    addToCartByBarcode,
    isAddingByBarcode,
    checkout,
    cancelCheckout, // API Call to cancel checkout
    isCheckingOut,
    isCancelingCheckout,
  } = useCart(currentIssuer.staffId);

  // Local price overrides (not persisted to backend until checkout)
  const [priceOverrides, setPriceOverrides] = useState<Map<string, number>>(new Map());

  // MARK: - Selected Products Mapping
  const selectedProducts = useMemo(() => {
    const map = new Map<number, GroupedProduct>();
    
    cartItems.forEach((item) => {
      const product = allProducts.find(p => p._id === item.data.productId || p._id === item.data._id);
      let productId = product?.id ?? 0;

      if (productId === 0) {

        if (item.data.id) productId = item.data.id;
      }

      if (!map.has(productId)) {
        const productInMap = productsMap.get(productId);
        const fallbackName = productInMap?.name || item.data.name || `${item.data.category?.name || ""} ${item.data.details || ""}`.trim() || "Unknown Product";

        map.set(productId, {
          productId: productId,
          name: fallbackName,
          items: [],
        });
      }

      const group = map.get(productId)!;
      // Apply price override if exists, otherwise use soldPrice from cart
      const overriddenPrice = priceOverrides.get(item.unique_id) ?? item.data.soldPrice;
      
      group.items.push({
        uniqueId: item.unique_id,
        productId: productId,
        name: item.data.name || group.name,
        unitPrice: overriddenPrice,
        imei: item.data.barcode,
        productData: item.data,
        expiredAt: item.expiredAt,
      });
    });

    return map;
  }, [cartItems, allProducts, productsMap, priceOverrides]);

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
  
  // State for session restoration
  const [restoredPayments, setRestoredPayments] = useState<Payment[]>([]);
  
  const [isLockedScreen, setIsLockedScreen] = useState(true);
  const confirmation = useConfirmation();
  const POS_PIN = "1234";

  // MARK: - Stock Logic
  const availableStock = useMemo(() => {
    const stockMap = new Map<number, number>();
    allProducts.forEach((p) => stockMap.set(p.id, p.quantity));

    for (const group of selectedProducts.values()) {
      const currentServerStock = stockMap.get(group.productId) || 0;
      stockMap.set(group.productId, currentServerStock - group.items.length);
    }
    return stockMap;
  }, [allProducts, selectedProducts]);

  // MARK: - Session Restoration & Sync
  useEffect(() => {
    if (isLockedScreen || isSessionLoading || !productsData) {
      return;
    }

    // UPDATE: Safely check if paymentSession exists AND has transactions
    if (paymentSession && paymentSession.transactions && paymentSession.transactions.length > 0) {
      console.log("[POS Session] Active session found, mapping payments:", paymentSession);
      
      const mappedPayments: Payment[] = paymentSession.transactions.map((t) => {
         const methodKey = t.method.toLowerCase() as PaymentMethod;
         return {
             method: methodKey,
             amount: t.amount,
             note: "บันทึกแล้ว",
             details: {
                 transactionId: t._id,
                 status: t.status
             }
         };
      });
      
      setRestoredPayments(mappedPayments);

      if (!paymentModalInfo.isOpen && mappedPayments.length > 0) {
          console.log("[POS Session] Auto-opening Payment Modal due to existing session");
          setPaymentModalInfo({ isOpen: true, mode: "retail" });
      }

    } else {
        // If session is empty/cleared, clear restored payments
        setRestoredPayments([]);
    }
  }, [isLockedScreen, isSessionLoading, productsData, paymentSession, paymentModalInfo.isOpen]);


  // MARK: - Callbacks & Handlers
  const setVatMode = useCallback((mode: VatCalculationMode) => setVatModeState(mode), []);
  const setWithholdingTaxPercent = useCallback((percent: number) => setWithholdingTaxPercentState(percent), []);
  const setWithholdingTaxVatMode = useCallback(
    (mode: "pre-vat" | "post-vat") => setWithholdingTaxVatModeState(mode),
    [],
  );

  const handleUnlockScreen = (pin: string) => {
    if (pin === POS_PIN) {
      setIsLockedScreen(false);
      const hasPendingItems = cartItems.some(item => item.status === "pending");
      
      if (hasPendingItems || (paymentSession?.transactions?.length ?? 0) > 0) {
        setPaymentModalInfo({ isOpen: true, mode: "retail" });
      }
    }
  };

  const addProductToCart = useCallback(
    (productToAdd: Product) => {
      if (productToAdd._id) {
        addToCart({ productId: productToAdd._id, employeeId: currentIssuer.staffId }, {
          onError: (error: unknown) => {
            console.error("Failed to add to cart:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const status = (error as any).response?.status;
            let title = "เกิดข้อผิดพลาด";
            let message = "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้";

            if (status === 409) {
              title = "สินค้าหมด";
              message = "สินค้าหมด (Out of stock)";
            } else if (status === 404) {
              title = "ไม่พบสินค้า";
              message = "ไม่พบข้อมูลสินค้า (Product not found)";
            }

            confirmation.showConfirmation({
              title,
              message,
              type: "error",
              confirmText: "ตกลง",
              showCancel: false,
            });
          },
          onSuccess: () => {}
        });
      }
    },
    [addToCart, confirmation, currentIssuer.staffId],
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemoveFromCart = useCallback((uniqueId: string, _name: string) => {
    removeFromCart(uniqueId, {
      onSuccess: () => {
        // Clear price override for removed item
        setPriceOverrides(prev => {
          const newMap = new Map(prev);
          newMap.delete(uniqueId);
          return newMap;
        });
      },
      onError: () => {
        confirmation.showConfirmation({
          title: "เกิดข้อผิดพลาด",
          message: "ไม่สามารถลบสินค้าออกจากตะกร้าได้",
          type: "error",
          confirmText: "ตกลง",
          showCancel: false,
        });
      }
    });
  }, [removeFromCart, confirmation]);

  const handleRenewItem = useCallback((uniqueId: string, productId: string) => {
      renewCartItem(uniqueId, productId).catch(err => console.error(err));
  }, [renewCartItem]);

  const handleUpdateItem = useCallback((uniqueId: string, price: number) => {
    // Store price locally without API call
    setPriceOverrides(prev => {
      const newMap = new Map(prev);
      newMap.set(uniqueId, price);
      return newMap;
    });
  }, []);

  const handleAddByBarcode = useCallback((barcode: string) => {
     addToCartByBarcode({ barcode, employeeId: currentIssuer.staffId }, {});
  }, [addToCartByBarcode, currentIssuer.staffId]);


  // MARK: - Cash & Payment Actions
  const { mutateAsync: confirmPaymentAsync } = useConfirmPayment();

  const handleCashDrawerActivity = (activity: CashDrawerActivity) => {
    setCashDrawerTransactions((prev) => [...prev, {
      ...activity,
      id: `trans_${Date.now()}`,
      timestamp: new Date(),
    }]);
  };

  const handlePaymentSuccess = async (payments: Payment[], change: number) => {
    console.log("ชำระเงินสำเร็จ:", { payments, change });
    
    // Calculate discount amount from applied discounts
    // Note: This logic duplicates the calculation in useMemo, might be better to extract or use the memoized value if available/passed
    // But for now, we can rely on what's in 'appliedDiscounts' and 'subtotal' (if accessible) or just recalculate.
    // Since 'subtotal' is available in the component scope, we can use it.
    
    let discountAmount = 0;
    // We need to calculate discount amount based on subtotal.
    // However, 'subtotal' is memoized and available here.
    allDiscounts.forEach((d) => {
      discountAmount += d.type === "percentage" ? subtotal * (d.value / 100) : d.value;
    });

    try {
        const payload: ConfirmPaymentPayload = {
            sellerId: currentIssuer.staffId,
            paymentDetails: payments.map(p => ({
                method: p.method.toUpperCase(),
                amount: p.amount,
                refNo: (p.details as { refNo?: string })?.refNo || "",
                timestamp: new Date().toISOString() // Or use p.details.timestamp if available
            })),
            customer: currentCustomer ? {
                customerType: currentCustomer.level || "general", // Map appropriately
                customerName: currentCustomer.name,
                phoneNumber: currentCustomer.phone
            } : undefined,
            isTaxInvoice: isTaxInvoice,
            discountAmount: discountAmount,
            vatMode: vatMode,
            // note: We might want to aggregate notes from payments or have a global note
            // For now, let's join notes from payments if any
            note: payments.map(p => p.note).filter(Boolean).join(", ")
        };

        const response = await confirmPaymentAsync(payload);
        console.log("Payment Confirmed:", response);
        
        // Update Stock (Optimistic update was done, but now we have server confirmation)
        // The server response 'sold_products' might be useful for receipt
        
        // We can pass the transaction ID or document ID to the success screen if needed
        // But PaymentModal handles the success screen internally.
        // If we need to print receipt with specific ID, we might need to store it in state
        // or pass it to PaymentModal (but PaymentModal is already open and in success state).
        
        // For now, just log and let the flow continue.
        
    } catch (error) {
        console.error("Confirm payment failed", error);
        confirmation.showConfirmation({
            title: "บันทึกการขายไม่สำเร็จ",
            message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลการขาย แต่การชำระเงินอาจจะสำเร็จแล้ว กรุณาตรวจสอบ",
            type: "error",
            confirmText: "ตกลง",
            showCancel: false
        });
    }

    // Legacy local update (can be removed if server handles it entirely, but keeping for safety/UI reflection)
    const updatePromises = Array.from(selectedProducts.values()).map((group) => {
      const product = productsMap.get(group.productId);
      if (!product) return Promise.resolve();
      const finalStock = Math.max(0, product.quantity - group.items.length);
      return updateProductMutation.mutateAsync({ id: product.id, payload: { quantity: finalStock } });
    });

    Promise.all(updatePromises)
      .then(() => console.log("Stock updated locally/remotely"))
      .catch((err) => console.error("Stock update error", err));
  };

  const handleFinishTransaction = () => {
    setAppliedDiscounts([]);
    setCurrentCustomer(null);
    handleClosePaymentModal();
  };

  // MARK: - Checkout / Cancel / Save Handlers
  
  const handleClosePaymentModal = () => setPaymentModalInfo({ isOpen: false, mode: "retail" });

  const handleOpenRetailPayment = async () => {
    if (selectedProducts.size > 0) {
      try {
        await checkout(currentIssuer.staffId);
        setPaymentModalInfo({ isOpen: true, mode: "retail" });
      } catch (error: unknown) {
        console.error("Checkout validation failed:", error);
        confirmation.showConfirmation({
          title: "ไม่สามารถชำระเงินได้",
          message: "เกิดข้อผิดพลาดในการเปิดเซสชั่นการขาย (Checkout Failed)",
          type: "error",
          confirmText: "ตกลง",
          showCancel: false,
        });
      }
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

  // NEW: Handle Saving Payment Methods to API
  const handleSavePaymentMethods = async (paymentsToSave: Payment[]) => {
      try {
          const payload = {
              employeeId: currentIssuer.staffId,
              payments: paymentsToSave.map((p) => ({
                  method: p.method.toUpperCase() as PaymentMethodType, 
                  amount: p.amount,
                  tendered: 0
              }))
          };
          await addPaymentAsync(payload);
      } catch (error) {
          console.error("Failed to save payments", error);
          confirmation.showConfirmation({
              title: "บันทึกไม่สำเร็จ",
              message: "ไม่สามารถบันทึกรายการชำระเงินได้",
              type: "error",
              confirmText: "ตกลง",
              showCancel: false
          });
          throw error; // Must throw so Modal knows it failed
      }
  };

  // NEW: Handle Cancellation of Transaction
  // This deletes session via API and allows the modal to close cleanly
  const handleCancelPaymentProcess = async () => {
     try {
         await cancelCheckout(currentIssuer.staffId);
         setRestoredPayments([]); // Clear local
         console.log("Transaction cancelled, session deleted.");
         // Important: We let the Modal call 'onClose' after this Promise resolves.
     } catch (err) {
         console.error("Failed to cancel checkout", err);
         confirmation.showConfirmation({
             title: "เกิดข้อผิดพลาด",
             message: "ไม่สามารถยกเลิกรายการได้ กรุณาลองใหม่อีกครั้ง",
             type: "error",
             confirmText: "ตกลง",
             showCancel: false
         });
         throw err; // Must throw so Modal stays open if cancellation fails
     }
  };

  const handleOpenCompanyPayment = () => setPaymentModalInfo({ isOpen: true, mode: "record-income" });

  // MARK: - Calculations
  const priceAdjustmentDiscounts = useMemo(() => {
    const adjustments: Discount[] = [];
    for (const group of selectedProducts.values()) {
      const originalProduct = productsMap.get(group.productId);
      if (!originalProduct) continue;
      group.items.forEach((item) => {
        const originalPrice = Number(originalProduct.prices?.level_1) || 0;
        const priceDifference = originalPrice - item.unitPrice;
        if (priceDifference > 0) {
          adjustments.push({ id: `adj-${item.uniqueId}`, name: `ส่วนลด ${item.name}`, type: "fixed", value: priceDifference });
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
      const originalProduct = productsMap.get(item.productId);
      const originalPrice = Number(originalProduct?.prices?.level_1) || item.unitPrice;
      return sum + originalPrice;
    }, 0);

    let discountAmount = 0;
    allDiscounts.forEach((d) => {
      discountAmount += d.type === "percentage" ? sub * (d.value / 100) : d.value;
    });
    const finalTotal = Math.max(0, sub - discountAmount);

    const summaryItems: SelectedItem[] = Array.from(selectedProducts.values()).map((group) => {
      const originalProduct = productsMap.get(group.productId);
      const originalPrice = Number(originalProduct?.prices?.level_1) || 0;
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
      console.log("Sending E-receipt to", currentCustomer.name);
    } else {
        confirmation.showConfirmation({ title: "ไม่พบข้อมูล", message: "กรุณาเลือกลูกค้า", type: "warning", confirmText: "ตกลง", showCancel: false });
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsCustomerModalOpen(false);
  };

  const handleAddNewCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    setCurrentCustomer(newCustomer);
    setIsCustomerModalOpen(false);
  };

  // UPDATE: Safe Total Calculation (Fixing the 'null' error)
  const paymentModalTotal = paymentSession?.summary?.grandTotal ?? total;

  return (
    <div id="pos-page-container" className="flex h-screen flex-col bg-gray-900 dark:bg-black">
      <POSLockScreen isLocked={isLockedScreen} onUnlock={handleUnlockScreen} correctPin={POS_PIN} />

      <TopBarComponent 
        activePosOperationMode={activePosOperationMode}
        setActivePosOperationMode={setActivePosOperationMode}
        currentIssuer={currentIssuer}
        setCurrentIssuer={setCurrentIssuer}
        allStaff={MOCK_STAFF}
      />

      <div className="flex flex-1 overflow-hidden pb-16 md:pb-0">
        <div id="pos-page-grid" className="flex h-full flex-1 flex-col gap-2 overflow-y-auto p-2 md:grid md:grid-cols-24 md:overflow-hidden">
          
          <div id="pos-selling-details-section" className="no-scrollbar order-1 shrink-0 overflow-y-auto rounded-lg md:order-none md:col-span-12 md:shrink lg:col-span-16">
            <ProductCategory
              onAddProduct={addProductToCart}
              availableStock={availableStock}
              isAdding={isAdding}
              addingProductId={addingProductId}
            />
          </div>

          <div id="pos-selling-action-section" className="order-2 flex w-full shrink-0 flex-col gap-2 overflow-hidden md:order-none md:col-span-12 md:flex-1 md:shrink lg:col-span-8">
            <SellingAction
              selectedProductsMap={selectedProducts}
              updateCart={() => {}}
              currentCustomer={currentCustomer}
              appliedDiscounts={appliedDiscounts}
              priceAdjustmentDiscounts={priceAdjustmentDiscounts}
              onDiscountsChange={setAppliedDiscounts}
              onOpenRetailPayment={handleOpenRetailPayment}
              productsMap={productsMap}
              // Safe active session check
              hasActiveSession={(paymentSession?.transactions?.length ?? 0) > 0}
              onRemoveItem={handleRemoveFromCart}
              onRenewItem={handleRenewItem}
              onUpdateItem={handleUpdateItem}
              onAddByBarcode={handleAddByBarcode}
              isLoading={isCartLoading || isRemoving || isAdding || isRenewing || isUpdating || isAddingByBarcode || isCheckingOut || isSessionLoading || isCancelingCheckout || isAddingPayment}
            />
          </div>
        </div>

        <div className="hidden md:block">
          <SidebarMenu
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onOpenDiscountModal={() => setIsDiscountModalOpen(true)}
            onOpenCashDrawerModal={() => setIsCashDrawerModalOpen(true)}
            onOpenSummaryModal={() => setIsSummaryModalOpen(true)}
            onOpenCompanyPayment={handleOpenCompanyPayment}
            onLockScreen={() => setIsLockedScreen(true)}
            onClearCart={() => {
              confirmation.showConfirmation({
                title: "ล้างข้อมูลการขาย",
                message: "คุณต้องการล้างข้อมูลการขายทั้งหมดหรือไม่?",
                type: "warning",
                confirmText: "ยืนยัน",
                showCancel: true,
                onConfirm: () => {
                  setCurrentCustomer(null);
                  setAppliedDiscounts([]);
                },
              });
            }}
          />
        </div>
      </div>

      {/* --- MODALS --- */}
      
      <PaymentModal
        isOpen={paymentModalInfo.isOpen}
        mode={paymentModalInfo.mode}
        onClose={handleClosePaymentModal}
        
        // Saving Handler
        onSavePaymentMethods={handleSavePaymentMethods}
        isSaving={isAddingPayment}
        
        // Cancellation Handler
        onCancelTransaction={handleCancelPaymentProcess}
        
        // Totals (Using safe value)
        totalToPay={paymentModalTotal}
        
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
        
        initialPayments={restoredPayments} 
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

      <FooterComponent
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
        onOpenDiscountModal={() => setIsDiscountModalOpen(true)}
        onOpenCashDrawerModal={() => setIsCashDrawerModalOpen(true)}
        onOpenSummaryModal={() => setIsSummaryModalOpen(true)}
        onOpenRetailPayment={handleOpenRetailPayment}
      />
    </div>
  );
}