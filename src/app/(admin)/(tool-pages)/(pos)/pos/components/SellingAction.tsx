"use client";
import React, { useState, useEffect, useMemo } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import ManagerModal from "./(modal)/ManagerModal";
import DiscountModal from "./(modal)/DiscountModal";
import CustomerModal from "./(modal)/CustomerModal";
import PaymentMethodModal from "./(modal)/(payment)/PaymentMethodModal";
import PaymentConfirmationModal from "./(modal)/(payment)/PaymentConfirmationModal";
import ProductSelectionModal from "./(modal)/(payment)/ProductSelectionModal";
import QuantitySelectionModal from "./(modal)/QuantitySelectionModal";
import { UserIcon } from "@/icons";

type SelectedItem = {
  id: number;
  name: string;
  unitPrice: number;
  qty: number;
  category?: {
    id: number;
    color: string;
    name: string;
  };
  unit?: {
    id: number;
    name: string;
  };
  barcode?: string;
};

type RawProduct = {
  id: number;
  name: string;
  prices: {
    level_1: string;
  };
  category?: {
    id: number;
    color: string;
    name: string;
  };
  unit?: {
    id: number;
    name: string;
  };
  barcode?: string;
};

type SortField = "name" | "price" | "category";
type SortOrder = "asc" | "desc";

interface SellingActionProps {
  selectedProducts: SelectedItem[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<SelectedItem[]>>;
}

export default function SellingAction({
  selectedProducts,
  setSelectedProducts,
}: SellingActionProps) {
  // Manager state
  const [currentManager, setCurrentManager] = useState<string>("Johny");
  const [managerRefId, setManagerRefId] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name?: string;
    level: "ทั่วไป" | "Silver" | "Gold" | "Platinum" | "Diamond";
  } | null>({
    level: "ทั่วไป",
  });
  const [customerNameInput, setCustomerNameInput] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<RawProduct[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Barcode Scanner State
  const [isScannerMode, setIsScannerMode] = useState<boolean>(false);
  const [scanMode, setScanMode] = useState<"quick" | "batch">("quick");
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [defaultQuantity, setDefaultQuantity] = useState<number>(1);
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [scanHistory, setScanHistory] = useState<
    Array<{ barcode: string; qty: number; time: string }>
  >([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedProductForQty, setSelectedProductForQty] =
    useState<RawProduct | null>(null);
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);

  // Manager Modal
  const {
    isOpen: managerModalOpen,
    openModal: openManagerModal,
    closeModal: closeManagerModal,
  } = useModal();

  // Discount Modal
  const {
    isOpen: discountModalOpen,
    openModal: openDiscountModal,
    closeModal: closeDiscountModal,
  } = useModal();

  // Customer state
  const {
    isOpen: buyerModalOpen,
    openModal: openBuyerModal,
    closeModal: closeBuyerModal,
  } = useModal();

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);

  // Product Selection Modal
  const {
    isOpen: productModalOpen,
    openModal: openProductModal,
    closeModal: closeProductModal,
  } = useModal();

  // Quantity Selection Modal
  const {
    isOpen: quantityModalOpen,
    openModal: openQuantityModal,
    closeModal: closeQuantityModal,
  } = useModal();

  // Payment Method Modal
  const {
    isOpen: paymentModalOpen,
    openModal: openPaymentModal,
    closeModal: closePaymentModal,
  } = useModal();

  const {
    isOpen: paymentConfirmModalOpen,
    openModal: openPaymentConfirmModal,
    closeModal: closePaymentConfirmModal,
  } = useModal();

  useEffect(() => {
    if (isScannerMode && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isScannerMode]);

  // Load products dynamically
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mod = await import("../mockData.json");
        const tbody = mod.default?.data?.tbody ?? mod.data?.tbody ?? [];
        if (isMounted) {
          setProducts(tbody as RawProduct[]);
        }
      } catch (e: unknown) {
        console.error("Failed to load mockData.json", e);
        if (isMounted) setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Map<number, { id: number; name: string; color: string }>();
    products.forEach((p) => {
      if (p.category && !cats.has(p.category.id)) {
        cats.set(p.category.id, {
          id: p.category.id,
          name: p.category.name,
          color: p.category.color,
        });
      }
    });
    return Array.from(cats.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || p.category?.id.toString() === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const sorted = filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortField) {
        case "name":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "price":
          compareValue =
            Number(a.prices?.level_1 ?? 0) - Number(b.prices?.level_1 ?? 0);
          break;
        case "category":
          compareValue = (a.category?.name ?? "").localeCompare(
            b.category?.name ?? "",
          );
          break;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [products, searchQuery, selectedCategory, sortField, sortOrder]);

  // Derived pagination values
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  }, [filteredProducts.length, pageSize]);

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const changePage = (next: number) => {
    setCurrentPage(Math.min(Math.max(1, next), totalPages));
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mod = await import("../mockData.json");
      const tbody = mod.default?.data?.tbody ?? mod.data?.tbody ?? [];
      setProducts(tbody as RawProduct[]);
    } catch (e: unknown) {
      console.error("Failed to refresh data", e);
      setError("ไม่สามารถรีเฟรชข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortField("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSelectCustomer = (
    level: "ทั่วไป" | "Silver" | "Gold" | "Platinum" | "Diamond",
  ) => {
    setSelectedCustomer({
      name: customerNameInput.trim() || "ลูกค้า " + level,
      level: level,
    });
    closeBuyerModal();
  };

  const handleUpdateCustomerName = () => {
    if (selectedCustomer) {
      setSelectedCustomer({
        ...selectedCustomer,
        name: customerNameInput.trim() || "ลูกค้า " + selectedCustomer.level,
      });
    }
  };

  // Selection handler
  const handleSelectProduct = (p: RawProduct) => {
    setSelectedProductForQty(p);
    setQuantityToAdd(1);
    openQuantityModal();
  };

  // Quick add product (1 piece)
  const handleQuickAddProduct = (p: RawProduct) => {
    const unitPrice = Number(p.prices?.level_1 ?? 0);
    setSelectedProducts((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) {
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          unitPrice: unitPrice,
          qty: 1,
          category: p.category,
          unit: p.unit,
          barcode: p.barcode,
        },
      ];
    });
  };

  // Confirm add product with quantity
  const handleConfirmAddProduct = () => {
    if (!selectedProductForQty) return;

    const p = selectedProductForQty;
    const unitPrice = Number(p.prices?.level_1 ?? 0);

    setSelectedProducts((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) {
        return prev.map((i) =>
          i.id === p.id ? { ...i, qty: i.qty + quantityToAdd } : i,
        );
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          unitPrice: unitPrice,
          qty: quantityToAdd,
          category: p.category,
          unit: p.unit,
          barcode: p.barcode,
        },
      ];
    });
    closeQuantityModal();
  };

  return (
    <ComponentCard className="w-full" title="การดำเนินการขาย">
      <div className="flex flex-col gap-8">
        {/* Product Management Section */}
        <div className="flex flex-col gap-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
              จัดการสินค้า
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="primary"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-2 text-2xl font-semibold shadow-lg transition-all hover:from-green-600 hover:to-emerald-700"
              onClick={openProductModal}
            >
              สินค้า
            </Button>
            <Button
              variant="outline"
              className="w-full py-2 text-2xl font-semibold"
              onClick={openDiscountModal}
            >
              ส่วนลด
            </Button>
          </div>

          <ProductSelectionModal
            isOpen={productModalOpen}
            onClose={closeProductModal}
            isLoading={isLoading}
            error={error}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortField={sortField}
            setSortField={setSortField}
            sortOrder={sortOrder}
            categories={categories}
            pagedProducts={pagedProducts}
            filteredProducts={filteredProducts}
            onRefresh={handleRefresh}
            onResetFilters={handleResetFilters}
            onQuickAdd={handleQuickAddProduct}
            onSelectProduct={handleSelectProduct}
            toggleSort={toggleSort}
            changePage={changePage}
          />

          <QuantitySelectionModal
            isOpen={quantityModalOpen}
            onClose={closeQuantityModal}
            selectedProduct={selectedProductForQty}
            quantity={quantityToAdd}
            setQuantity={setQuantityToAdd}
            onConfirm={handleConfirmAddProduct}
          />

          <DiscountModal
            isOpen={discountModalOpen}
            onClose={closeDiscountModal}
          />
        </div>

        {/* Payment Section */}
        <div className="rounded-lg">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
              ยอดสรุป
            </span>
          </div>
          <div className="mb-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-3 dark:from-emerald-950/20 dark:to-teal-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xl font-medium text-gray-700 dark:text-gray-300">
                รายการสินค้า
              </span>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedProducts.length} รายการ
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-emerald-200/50 pt-2 dark:border-emerald-800/50">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ยอดรวมทั้งสิ้น
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                ฿
                {selectedProducts
                  .reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-2 text-sm font-semibold shadow-lg transition-all hover:from-purple-600 hover:to-pink-700"
            onClick={openPaymentModal}
            disabled={selectedProducts.length === 0}
          >
            <span className="mr-2">💳</span> เลือกวิธีชำระเงิน
          </Button>

          {selectedPaymentMethod && (
            <div className="mt-2 rounded-lg border-2 border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/30">
              <p className="text-center text-xs font-semibold text-green-700 dark:text-green-400">
                เลือกชำระด้วย: {selectedPaymentMethod}
              </p>
            </div>
          )}

          <PaymentMethodModal
            isOpen={paymentModalOpen}
            onClose={closePaymentModal}
            selectedProducts={selectedProducts}
            onSelectMethod={(method) => {
              setSelectedPaymentMethod(method);
              closePaymentModal();
              openPaymentConfirmModal();
            }}
          />

          <PaymentConfirmationModal
            isOpen={paymentConfirmModalOpen}
            onClose={closePaymentConfirmModal}
            paymentMethod={selectedPaymentMethod}
            selectedProducts={selectedProducts}
            onConfirm={() => {
              setSelectedPaymentMethod(null);
              setSelectedProducts([]);
              closePaymentConfirmModal();
            }}
            onBack={() => {
              setSelectedPaymentMethod(null);
              openPaymentConfirmModal();
              closePaymentConfirmModal();
            }}
          />
        </div>

        {/* Manager Section */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
              ผู้ดูแลการขาย
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-2.5 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white shadow">
              <span className="text-sm font-bold">
                {currentManager.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <span className="block text-xl text-gray-600 dark:text-gray-400">
                ผู้ขายปัจจุบัน
              </span>
              <span className="block text-xl font-bold text-gray-900 dark:text-white">
                {currentManager}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-2 w-full py-2 text-sm"
            onClick={openManagerModal}
          >
            เลือกผู้ขายอื่น
          </Button>

          <ManagerModal
            isOpen={managerModalOpen}
            onClose={closeManagerModal}
            currentManager={currentManager}
            managerRefId={managerRefId}
            onManagerRefIdChange={setManagerRefId}
            onConfirm={(refId) => {
              setCurrentManager(refId);
              setManagerRefId("");
              closeManagerModal();
            }}
          />
        </div>

        {/* Customer Section */}
        <div className="rounded-lg">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
              ข้อมูลลูกค้า
            </span>
          </div>
          {selectedCustomer ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-2.5 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500 text-white shadow">
                  <UserIcon />
                </div>
                <div className="flex-1">
                  <span className="block text-xl text-gray-600 dark:text-gray-400">
                    ลูกค้าปัจจุบัน ({selectedCustomer.level})
                  </span>
                  <span className="block text-xl font-bold text-gray-900 dark:text-white">
                    {selectedCustomer.name}
                  </span>
                </div>
              </div>

              {/* Customer Name Input */}
              <div className="flex flex-col gap-1">
                <label className="text-xl font-medium text-gray-600 dark:text-gray-400">
                  ชื่อลูกค้า
                </label>
                <div className="flex gap-2 text-xl">
                  <input
                    type="text"
                    value={customerNameInput}
                    onChange={(e) => setCustomerNameInput(e.target.value)}
                    placeholder="กรอกชื่อลูกค้า (ค่าเริ่มต้น: ลูกค้า + ระดับ)"
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-purple-400 dark:focus:ring-purple-400"
                  />
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-2 text-sm font-semibold shadow transition-all hover:from-purple-600 hover:to-pink-600"
                    onClick={handleUpdateCustomerName}
                  >
                    บันทึก
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full py-2 text-sm"
                onClick={openBuyerModal}
              >
                เปลี่ยนลูกค้า
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full py-2 text-sm font-semibold"
              onClick={openBuyerModal}
            >
              เลือกลูกค้า
            </Button>
          )}

          <CustomerModal
            isOpen={buyerModalOpen}
            onClose={closeBuyerModal}
            onSelectLevel={(level) => {
              handleSelectCustomer(level);
            }}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
