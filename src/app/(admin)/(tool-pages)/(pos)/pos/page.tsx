"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SellingDetails from "./components/SellingDetails";
import Button from "@/components/ui/button/Button";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import React, { useEffect, useMemo, useState } from "react";
import {
  BiReceipt,
  PencilIcon,
  UserIcon,
  FaMoneyBillWave,
  FaQrcode,
  FaCreditCard,
} from "@/icons";

// Note: metadata export is not allowed in client components.

// Types for products and selected cart items
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

export default function Page() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: discountModalOpen,
    openModal: openDiscountModal,
    closeModal: closeDiscountModal,
  } = useModal();
  const {
    isOpen: buyerModalOpen,
    openModal: openBuyerModal,
    closeModal: closeBuyerModal,
  } = useModal();
  const {
    isOpen: paymentModalOpen,
    openModal: openPaymentModal,
    closeModal: closePaymentModal,
  } = useModal();
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    level: string;
  } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [currentManager, setCurrentManager] = useState<string>("nakka");
  const [managerRefId, setManagerRefId] = useState<string>("");
  const {
    isOpen: managerModalOpen,
    openModal: openManagerModal,
    closeModal: closeManagerModal,
  } = useModal();
  const {
    isOpen: paymentConfirmModalOpen,
    openModal: openPaymentConfirmModal,
    closeModal: closePaymentConfirmModal,
  } = useModal();
  const {
    isOpen: quantityModalOpen,
    openModal: openQuantityModal,
    closeModal: closeQuantityModal,
  } = useModal();

  // Handler function when a customer level is selected
  const handleSelectCustomer = (level: string) => {
    // In a real application, you might fetch customer data
    // For now, we'll just set a mock customer
    setSelectedCustomer({ name: "ลูกค้า " + level, level: level });
    closeBuyerModal();
  };

  // Product loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<RawProduct[]>([]);

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selected products state
  const [selectedProducts, setSelectedProducts] = useState<SelectedItem[]>([]);

  // State for quantity modal
  const [selectedProductForQty, setSelectedProductForQty] =
    useState<RawProduct | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);

  // Load products dynamically to allow loading and error states
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mod = await import("./mockData.json");
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

  // Derived pagination values
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(products.length / pageSize));
  }, [products.length, pageSize]);

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage, pageSize]);

  const changePage = (next: number) => {
    setCurrentPage(Math.min(Math.max(1, next), totalPages));
  };

  // Selection handler
  const handleSelectProduct = (p: RawProduct) => {
    setSelectedProductForQty(p);
    setQuantityToAdd(1);
    openQuantityModal();
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

  return (
    <div className="min-h-screen">
      <PageBreadcrumb pageTitle="ระบบ POS" />
      <div className="bg-white dark:bg-gray-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
          {/* Selling Details */}
          <div className="w-full">
            <SellingDetails
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />
          </div>

          {/* Selling Action */}
          <div className="flex w-full flex-col gap-4 lg:w-1/3">
            {/* Selling Manager */}
            <ComponentCard className="w-full" title="ผู้ดูแลการขาย">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
                    <span className="text-lg font-bold">
                      {currentManager.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm text-gray-600 dark:text-gray-400">
                      ผู้ขายปัจจุบัน
                    </span>
                    <span className="block text-lg font-bold text-gray-900 dark:text-white">
                      {currentManager}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={openManagerModal}
                >
                  เลือกผู้ขายอื่น
                </Button>
              </div>

              {/* Manager Selection Modal */}
              <Modal
                isOpen={managerModalOpen}
                onClose={closeManagerModal}
                className="w-full max-w-[500px] rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex flex-col gap-6">
                  <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      👤 เปลี่ยนผู้ขาย
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      กรอกรหัสอ้างอิงของผู้ขายเพื่อสลับการขาย
                    </p>
                  </div>

                  {/* Current Manager Info */}
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ผู้ขายปัจจุบัน
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                      {currentManager}
                    </p>
                  </div>

                  {/* Manager ID Input */}
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="managerRefId"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      รหัสอ้างอิงผู้ขาย (Manager ID)
                    </label>
                    <input
                      id="managerRefId"
                      type="text"
                      placeholder="เช่น: MGR001, nakka_v2, ..."
                      value={managerRefId}
                      onChange={(e) => setManagerRefId(e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ✓ ป้อนรหัสผู้ขายที่ต้องการสลับเข้ามา
                    </p>
                  </div>

                  {/* Preview */}
                  {managerRefId.trim() && (
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ผู้ขายใหม่
                      </p>
                      <p className="mt-1 text-lg font-bold text-green-700 dark:text-green-300">
                        {managerRefId}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={closeManagerModal}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      onClick={() => {
                        if (managerRefId.trim()) {
                          setCurrentManager(managerRefId.trim());
                          setManagerRefId("");
                          closeManagerModal();
                        }
                      }}
                      disabled={!managerRefId.trim()}
                    >
                      ✓ ยืนยันเปลี่ยนผู้ขาย
                    </Button>
                  </div>
                </div>
              </Modal>
            </ComponentCard>

            {/* Add Product Action */}
            <ComponentCard className="w-full" title="การขายสินค้า">
              <div className="flex flex-col space-y-4">
                <Button
                  variant="primary"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-base font-semibold shadow-lg transition-all hover:from-green-600 hover:to-emerald-700 hover:shadow-xl"
                  onClick={openModal}
                >
                  <span className="mr-2">+</span> เพิ่มสินค้า
                </Button>
                <Modal
                  isOpen={isOpen}
                  onClose={closeModal}
                  className="w-full max-w-[900px] rounded-2xl p-6 shadow-2xl lg:p-10"
                >
                  <div className="flex flex-col gap-4">
                    <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        🛍️ เลือกสินค้า
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        เลือกสินค้าที่ต้องการเพิ่มในรายการขาย
                      </p>
                    </div>
                    {/* Controls */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          แสดงต่อหน้า:
                        </span>
                        <select
                          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-colors focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                      <div className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        หน้า {currentPage} / {totalPages}
                      </div>
                    </div>

                    {/* Loading / Error */}
                    {isLoading && (
                      <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                        กำลังโหลดข้อมูล...
                      </div>
                    )}
                    {error && (
                      <div className="py-8 text-center text-red-500">
                        {error}
                      </div>
                    )}

                    {/* Product List */}
                    {!isLoading && !error && (
                      <div className="custom-scrollbar max-h-[420px] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                              <TableCell
                                isHeader
                                className="py-3 text-start font-bold"
                              >
                                สินค้า
                              </TableCell>
                              <TableCell
                                isHeader
                                className="py-3 text-center font-bold"
                              >
                                หมวดหมู่
                              </TableCell>
                              <TableCell
                                isHeader
                                className="hidden py-3 text-center font-bold sm:table-cell"
                              >
                                ราคา/หน่วย
                              </TableCell>
                              <TableCell
                                isHeader
                                className="py-3 text-center font-bold"
                              >
                                หน่วย
                              </TableCell>
                              <TableCell
                                isHeader
                                className="py-3 text-center font-bold"
                              >
                                เลือก
                              </TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {pagedProducts.map((p, idx) => (
                              <TableRow
                                key={p.id}
                                className={`transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/20 ${
                                  idx % 2 === 0
                                    ? "bg-white dark:bg-gray-950"
                                    : "bg-gray-50/50 dark:bg-gray-900/50"
                                }`}
                              >
                                <TableCell className="py-3 font-medium text-gray-900 dark:text-white">
                                  {p.name}
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className="flex justify-center">
                                    {p.category ? (
                                      <span
                                        className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                                        style={{
                                          backgroundColor: p.category.color,
                                        }}
                                      >
                                        {p.category.name}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-400 dark:text-gray-500">
                                        -
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden py-3 text-center font-semibold text-gray-700 sm:table-cell dark:text-gray-300">
                                  ฿{Number(p.prices?.level_1 ?? 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                                  {p.unit?.name ?? "-"}
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-green-500 to-emerald-600 font-semibold hover:from-green-600 hover:to-emerald-700"
                                      onClick={() => handleQuickAddProduct(p)}
                                    >
                                      +1
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                      onClick={() => handleSelectProduct(p)}
                                    >
                                      + เพิ่ม
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && !error && (
                      <div className="flex items-center justify-between gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
                        <Button
                          variant="outline"
                          className="font-semibold"
                          onClick={() => changePage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          ← ก่อนหน้า
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold hover:from-blue-600 hover:to-indigo-700"
                          onClick={() => changePage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          ถัดไป →
                        </Button>
                      </div>
                    )}
                  </div>
                </Modal>

                {/* Quantity Selection Modal */}
                <Modal
                  isOpen={quantityModalOpen}
                  onClose={closeQuantityModal}
                  className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
                >
                  <div className="flex flex-col gap-6">
                    {selectedProductForQty && (
                      <>
                        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            ระบุจำนวนเพิ่ม
                          </h4>
                          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {selectedProductForQty.name}
                          </p>
                          {selectedProductForQty.category && (
                            <span
                              className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                              style={{
                                backgroundColor:
                                  selectedProductForQty.category.color,
                              }}
                            >
                              {selectedProductForQty.category.name}
                            </span>
                          )}
                          <p className="mt-3 text-base font-bold text-green-600 dark:text-green-400">
                            ฿
                            {Number(
                              selectedProductForQty.prices?.level_1 ?? 0,
                            ).toFixed(2)}{" "}
                            / {selectedProductForQty.unit?.name || "ชิ้น"}
                          </p>
                        </div>

                        {/* Quantity Input */}
                        <div className="flex flex-col gap-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            จำนวนที่ต้องการเพิ่ม:
                          </label>
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-10 w-10 rounded-full p-0 text-lg"
                              onClick={() =>
                                setQuantityToAdd(Math.max(1, quantityToAdd - 1))
                              }
                            >
                              −
                            </Button>
                            <input
                              type="number"
                              value={quantityToAdd}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setQuantityToAdd(Math.max(1, val));
                              }}
                              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-lg font-bold transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                              min="1"
                            />
                            <Button
                              size="sm"
                              className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 p-0 text-lg hover:from-green-600 hover:to-emerald-700"
                              onClick={() =>
                                setQuantityToAdd(quantityToAdd + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              รวมทั้งสิ้น:
                            </span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              ฿
                              {(
                                Number(
                                  selectedProductForQty.prices?.level_1 ?? 0,
                                ) * quantityToAdd
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 font-semibold"
                            onClick={closeQuantityModal}
                          >
                            ยกเลิก
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 font-semibold hover:from-green-600 hover:to-emerald-700"
                            onClick={handleConfirmAddProduct}
                          >
                            ✓ ยืนยันเพิ่มสินค้า
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </Modal>
              </div>
            </ComponentCard>

            {/* Discount Action */}
            <ComponentCard className="" title="ส่วนลด">
              <Button
                variant="outline"
                className="w-full py-3 text-base font-semibold transition-all"
                onClick={openDiscountModal}
              >
                <span className="mr-2">🎟️</span> เลือกส่วนลด
              </Button>
              <Modal
                isOpen={discountModalOpen}
                onClose={closeDiscountModal}
                className="w-full max-w-[450px] rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex flex-col gap-6">
                  <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      🎟️ เลือกวิธีใช้ส่วนลด
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      เลือกวิธีการที่ต้องการใช้ส่วนลด
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all hover:shadow-lg"
                    >
                      <BiReceipt className="h-10 w-10" />
                      <span className="font-semibold text-gray-800 dark:text-white">
                        สแกน
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all hover:shadow-lg"
                    >
                      <PencilIcon className="h-10 w-10" />
                      <span className="font-semibold text-gray-800 dark:text-white">
                        กรอกรหัส
                      </span>
                    </Button>
                  </div>
                </div>
              </Modal>
            </ComponentCard>

            {/* Buyer action */}
            <ComponentCard className="" title="ข้อมูลลูกค้า">
              {selectedCustomer ? (
                // ---- View to show WHEN a customer IS selected ----
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg">
                      <UserIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm text-gray-600 dark:text-gray-400">
                        ลูกค้าปัจจุบัน ({selectedCustomer.level})
                      </span>
                      <span className="block text-lg font-bold text-gray-900 dark:text-white">
                        {selectedCustomer.name}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={openBuyerModal}
                  >
                    เปลี่ยนลูกค้า
                  </Button>
                </div>
              ) : (
                // ---- View to show WHEN NO customer is selected ----
                <Button
                  variant="outline"
                  className="w-full py-3 text-base font-semibold transition-all"
                  onClick={openBuyerModal}
                >
                  <span className="mr-2">👤</span> เลือกลูกค้า
                </Button>
              )}

              {/* Modal for selecting customer level */}
              <Modal
                isOpen={buyerModalOpen}
                onClose={closeBuyerModal}
                className="w-full max-w-[600px] rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex flex-col gap-6">
                  <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      👥 เลือกระดับลูกค้า
                    </h4>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      เลือกระดับสมาชิกเพื่อใช้สิทธิพิเศษ
                    </p>
                  </div>

                  {/* Customer Level Options */}
                  <div className="grid gap-3">
                    {[
                      {
                        level: "ทั่วไป",
                        emoji: "🙋",
                        color: "from-gray-400 to-gray-600",
                        bgColor: "bg-gray-50",
                        darkBg: "dark:bg-gray-900/50",
                        description: "ลูกค้าปกติ",
                      },
                      {
                        level: "Silver",
                        emoji: "🥈",
                        color: "from-gray-300 to-slate-500",
                        bgColor: "bg-slate-50",
                        darkBg: "dark:bg-slate-900/30",
                        description: "สมาชิกระดับ Silver",
                      },
                      {
                        level: "Gold",
                        emoji: "🥇",
                        color: "from-yellow-400 to-amber-600",
                        bgColor: "bg-yellow-50",
                        darkBg: "dark:bg-yellow-900/30",
                        description: "สมาชิกระดับ Gold",
                      },
                      {
                        level: "Platinum",
                        emoji: "💎",
                        color: "from-cyan-400 to-blue-600",
                        bgColor: "bg-cyan-50",
                        darkBg: "dark:bg-cyan-900/30",
                        description: "สมาชิก VIP - Platinum",
                      },
                      {
                        level: "Diamond",
                        emoji: "👑",
                        color: "from-pink-400 to-rose-600",
                        bgColor: "bg-pink-50",
                        darkBg: "dark:bg-pink-900/30",
                        description: "สมาชิก VIP - Diamond",
                      },
                    ].map((item) => (
                      <button
                        key={item.level}
                        onClick={() => handleSelectCustomer(item.level)}
                        className={`group rounded-xl border-2 border-gray-200 p-4 text-left transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:hover:border-blue-500 ${item.bgColor} ${item.darkBg}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-2xl shadow-md transition-transform group-hover:scale-110 ${item.color}`}
                          >
                            {item.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-bold text-gray-900 dark:text-white">
                              {item.level}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {item.description}
                            </div>
                          </div>
                          <div className="text-2xl text-gray-300 transition-colors group-hover:text-blue-500">
                            →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={closeBuyerModal}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </Modal>
            </ComponentCard>

            {/* Payment Summary & Method Selection */}
            <ComponentCard
              className="shadow-md transition-shadow hover:shadow-lg"
              title="สรุปรายการและชำระเงิน"
            >
              <div className="flex flex-col gap-4">
                {/* Summary Info */}
                <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/20 dark:to-teal-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      รายการสินค้า
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedProducts.length} รายการ
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-emerald-200/50 pt-2 dark:border-emerald-800/50">
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      ยอดรวมทั้งสิ้น
                    </span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      ฿
                      {selectedProducts
                        .reduce(
                          (sum, item) => sum + item.unitPrice * item.qty,
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Button */}
                <Button
                  variant="primary"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-3 text-base font-semibold shadow-lg transition-all hover:from-purple-600 hover:to-pink-700 hover:shadow-xl"
                  onClick={openPaymentModal}
                  disabled={selectedProducts.length === 0}
                >
                  <span className="mr-2">💳</span> เลือกวิธีชำระเงิน
                </Button>

                {selectedPaymentMethod && (
                  <div className="rounded-lg border-2 border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
                    <p className="text-center text-sm font-semibold text-green-700 dark:text-green-400">
                      ✓ เลือกชำระด้วย: {selectedPaymentMethod}
                    </p>
                    <Button
                      variant="primary"
                      className="mt-2 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      onClick={openPaymentConfirmModal}
                    >
                      ไปยังขั้นตอนการชำระ
                    </Button>
                  </div>
                )}
              </div>

              {/* Payment Method Modal */}
              <Modal
                isOpen={paymentModalOpen}
                onClose={closePaymentModal}
                className="w-full max-w-[550px] rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex flex-col gap-6">
                  <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      💳 เลือกวิธีชำระเงิน
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      กรุณาเลือกวิธีการชำระเงินที่ต้องการ
                    </p>
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 p-3 dark:from-emerald-950/40 dark:to-teal-950/40">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ยอดที่ต้องชำระ
                      </span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ฿
                        {selectedProducts
                          .reduce(
                            (sum, item) => sum + item.unitPrice * item.qty,
                            0,
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Cash Payment */}
                    <Button
                      variant="outline"
                      className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all hover:border-green-500 hover:bg-green-50 hover:shadow-lg dark:hover:bg-green-950/30"
                      onClick={() => {
                        setSelectedPaymentMethod("เงินสด");
                        closePaymentModal();
                      }}
                    >
                      <FaMoneyBillWave className="h-12 w-12 text-green-600 dark:text-green-400" />
                      <span className="font-bold text-gray-800 dark:text-white">
                        เงินสด
                      </span>
                    </Button>

                    {/* QR Payment */}
                    <Button
                      variant="outline"
                      className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg dark:hover:bg-blue-950/30"
                      onClick={() => {
                        setSelectedPaymentMethod("QR PromptPay");
                        closePaymentModal();
                      }}
                    >
                      <FaQrcode className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-gray-800 dark:text-white">
                        QR PromptPay
                      </span>
                    </Button>

                    {/* Credit/Debit Card */}
                    <Button
                      variant="outline"
                      className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl p-6 transition-all hover:border-purple-500 hover:bg-purple-50 hover:shadow-lg dark:hover:bg-purple-950/30"
                      onClick={() => {
                        setSelectedPaymentMethod("บัตรเครดิต/เดบิต");
                        closePaymentModal();
                      }}
                    >
                      <FaCreditCard className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                      <span className="font-bold text-gray-800 dark:text-white">
                        บัตรเครดิต/เดบิต
                      </span>
                    </Button>
                  </div>

                  <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={closePaymentModal}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </Modal>

              {/* Payment Confirmation Modal */}
              <Modal
                isOpen={paymentConfirmModalOpen}
                onClose={closePaymentConfirmModal}
                className="w-full max-w-[700px] rounded-2xl p-6 shadow-2xl lg:max-w-[800px]"
              >
                <div className="flex flex-col gap-6">
                  {selectedPaymentMethod === "เงินสด" && (
                    <>
                      {/* CASH PAYMENT */}
                      <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                          💵 ชำระเงินสด
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          ยืนยันการชำระเงินสดและปิดรายการ
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="space-y-2 rounded-lg bg-gray-50 p-6 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ราคาสินค้า
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ฿
                            {selectedProducts
                              .reduce(
                                (sum, item) => sum + item.unitPrice * item.qty,
                                0,
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              ยอดรวมทั้งสิ้น
                            </span>
                            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                              ฿
                              {selectedProducts
                                .reduce(
                                  (sum, item) =>
                                    sum + item.unitPrice * item.qty,
                                  0,
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cash Info */}
                      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                          ✓ ลูกค้าชำระเงินสดแล้ว
                        </p>
                        <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                          กรุณาเก็บเงิน{" "}
                          {selectedProducts
                            .reduce(
                              (sum, item) => sum + item.unitPrice * item.qty,
                              0,
                            )
                            .toFixed(2)}{" "}
                          บาท
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1 py-3 text-base font-semibold"
                          onClick={() => {
                            setSelectedPaymentMethod(null);
                            closePaymentConfirmModal();
                          }}
                        >
                          ← ย้อนกลับ
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-base font-semibold hover:from-green-600 hover:to-emerald-700"
                          onClick={() => {
                            window.print();
                            alert("ชำระเงินสำเร็จ! รายการถูกปิดแล้ว");
                            setSelectedPaymentMethod(null);
                            setSelectedProducts([]);
                            closePaymentConfirmModal();
                          }}
                        >
                          ✓ ยืนยันชำระเงิน
                        </Button>
                      </div>
                    </>
                  )}

                  {selectedPaymentMethod === "QR PromptPay" && (
                    <>
                      {/* QR PAYMENT */}
                      <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                          📱 QR PromptPay
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          สแกน QR Code เพื่อชำระเงิน
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="space-y-2 rounded-lg bg-gray-50 p-6 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold text-gray-900 dark:text-white">
                            ยอดที่ต้องชำระ
                          </span>
                          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            ฿
                            {selectedProducts
                              .reduce(
                                (sum, item) => sum + item.unitPrice * item.qty,
                                0,
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* QR Code Display (Mock) */}
                      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-12 dark:border-blue-700 dark:bg-blue-950/30">
                        <div className="text-6xl">📲</div>
                        <p className="mt-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          QR Code PromptPay
                        </p>
                        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                          สแกนด้วยแอปพลิเคชันของคุณ
                        </p>
                      </div>

                      {/* Status */}
                      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          ⏳ รอการชำระเงิน...
                        </p>
                        <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                          กรุณารอให้ลูกค้าสแกน QR Code
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1 py-3 text-base font-semibold"
                          onClick={() => {
                            setSelectedPaymentMethod(null);
                            closePaymentConfirmModal();
                          }}
                        >
                          ← ย้อนกลับ
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 py-3 text-base font-semibold hover:from-blue-600 hover:to-cyan-700"
                          onClick={() => {
                            alert("ชำระเงินผ่าน QR PromptPay สำเร็จ!");
                            window.print();
                            setSelectedPaymentMethod(null);
                            setSelectedProducts([]);
                            closePaymentConfirmModal();
                          }}
                        >
                          ✓ ยืนยันการชำระเงิน
                        </Button>
                      </div>
                    </>
                  )}

                  {selectedPaymentMethod === "บัตรเครดิต/เดบิต" && (
                    <>
                      {/* CARD PAYMENT */}
                      <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                          💳 บัตรเครดิต/เดบิต
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          ยืนยันการชำระเงินด้วยบัตร
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="space-y-2 rounded-lg bg-gray-50 p-6 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold text-gray-900 dark:text-white">
                            ยอดที่ต้องชำระ
                          </span>
                          <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            ฿
                            {selectedProducts
                              .reduce(
                                (sum, item) => sum + item.unitPrice * item.qty,
                                0,
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Card Info (Mock) */}
                      <div className="rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
                        <p className="text-sm font-semibold">
                          DEBIT / CREDIT CARD
                        </p>
                        <p className="mt-4 text-2xl tracking-widest">
                          •••• •••• •••• 1234
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-purple-200">
                              Card Holder
                            </p>
                            <p className="font-semibold">Customer</p>
                          </div>
                          <div>
                            <p className="text-xs text-purple-200">Expires</p>
                            <p className="font-semibold">12/26</p>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                          ⏳ ประมวลผลการชำระเงิน...
                        </p>
                        <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                          กรุณารอให้ระบบประมวลผล
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1 py-3 text-base font-semibold"
                          onClick={() => {
                            setSelectedPaymentMethod(null);
                            closePaymentConfirmModal();
                          }}
                        >
                          ← ย้อนกลับ
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 py-3 text-base font-semibold hover:from-purple-600 hover:to-pink-700"
                          onClick={() => {
                            alert("ชำระเงินผ่านบัตรสำเร็จ!");
                            window.print();
                            setSelectedPaymentMethod(null);
                            setSelectedProducts([]);
                            closePaymentConfirmModal();
                          }}
                        >
                          ✓ ยืนยันการชำระเงิน
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Modal>
            </ComponentCard>
          </div>
        </div>
      </div>
    </div>
  );
}
