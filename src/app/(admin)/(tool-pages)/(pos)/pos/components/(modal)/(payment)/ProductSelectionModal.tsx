"use client";

// Added useEffect to the import list
import React, { memo, useEffect } from "react";
import Button from "../../../../../../../../components/ui/button/Button";
import { Modal } from "../../../../../../../../components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../../../../../components/ui/table";
import FilterSection from "../../(add-product)/FilterSection";

// --- TYPE DEFINITIONS ---
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

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortOrder: SortOrder;
  categories: Array<{ id: number; name: string; color: string }>;
  pagedProducts: RawProduct[];
  filteredProducts: RawProduct[];
  onRefresh: () => void;
  onResetFilters: () => void;
  onQuickAdd: (product: RawProduct) => void;
  onSelectProduct: (product: RawProduct) => void;
  toggleSort: (field: SortField) => void;
  changePage: (page: number) => void;
}

// --- SUB-COMPONENTS ---

const ModalHeader = memo(() => (
  <div className="border-b border-gray-200 p-6 lg:p-10 dark:border-gray-800">
    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
      🛍️ เลือกสินค้า
    </h4>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      เลือกสินค้าที่ต้องการเพิ่มในรายการขาย
    </p>
  </div>
));
ModalHeader.displayName = "ModalHeader";

const ProductTable = memo(
  ({
    pagedProducts,
    sortField,
    sortOrder,
    toggleSort,
    onQuickAdd,
    onSelectProduct,
  }: any) => (
    <div className="isolate hidden overflow-hidden rounded-xl border border-gray-200 md:block dark:border-gray-700">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <TableCell isHeader className="py-3 text-start font-bold">
                <button
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  สินค้า{" "}
                  {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </TableCell>
              <TableCell isHeader className="py-3 text-center font-bold">
                <button
                  onClick={() => toggleSort("category")}
                  className="flex items-center justify-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  หมวดหมู่{" "}
                  {sortField === "category" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </TableCell>
              <TableCell isHeader className="py-3 text-center font-bold">
                <button
                  onClick={() => toggleSort("price")}
                  className="flex items-center justify-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  ราคา/หน่วย{" "}
                  {sortField === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </TableCell>
              <TableCell isHeader className="py-3 text-center font-bold">
                หน่วย
              </TableCell>
              <TableCell isHeader className="py-3 text-center font-bold">
                เลือก
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {pagedProducts.map((p: RawProduct, idx: number) => (
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
                        style={{ backgroundColor: p.category.color }}
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
                <TableCell className="py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
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
                      onClick={() => onQuickAdd(p)}
                    >
                      +1
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      onClick={() => onSelectProduct(p)}
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
    </div>
  ),
);
ProductTable.displayName = "ProductTable";

const ProductCardGrid = memo(
  ({ pagedProducts, onQuickAdd, onSelectProduct }: any) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
      {pagedProducts.map((p: RawProduct) => (
        <div
          key={p.id}
          className="rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Mobile Card Content */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="line-clamp-2 font-bold text-gray-900 dark:text-white">
                {p.name}
              </h3>
              {p.category && (
                <span
                  className="mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: p.category.color }}
                >
                  {p.category.name}
                </span>
              )}
            </div>
          </div>
          <div className="mb-4 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">ราคา:</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ฿{Number(p.prices?.level_1 ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">หน่วย:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {p.unit?.name ?? "-"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 font-semibold hover:from-green-600 hover:to-emerald-700"
              onClick={() => onQuickAdd(p)}
            >
              +1
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              onClick={() => onSelectProduct(p)}
            >
              + เพิ่ม
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
);
ProductCardGrid.displayName = "ProductCardGrid";

const StatusDisplay = memo(({ isLoading, error, hasProducts }: any) => {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-600 dark:text-gray-400">
        กำลังโหลดข้อมูล...
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 dark:bg-red-950/30 dark:text-red-400">
        {error}
      </div>
    );
  }
  if (!hasProducts) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-4xl">🔍</div>
        <p className="text-gray-600 dark:text-gray-400">
          ไม่พบสินค้าที่ตรงกับการค้นหา
        </p>
      </div>
    );
  }
  return null;
});
StatusDisplay.displayName = "StatusDisplay";

const ModalFooter = memo(({ currentPage, totalPages, changePage }: any) => (
  <div className="border-t border-gray-200 bg-white p-6 lg:p-10 dark:border-gray-700 dark:bg-gray-900">
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <Button
        variant="outline"
        className="w-full font-semibold sm:w-auto"
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← ก่อนหน้า
      </Button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        หน้า {currentPage} จาก {totalPages}
      </span>
      <Button
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold hover:from-blue-600 hover:to-indigo-700 sm:w-auto"
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ถัดไป →
      </Button>
    </div>
  </div>
));
ModalFooter.displayName = "ModalFooter";

// --- MAIN COMPONENT ---
export default function ProductSelectionModal(
  props: ProductSelectionModalProps,
) {
  const {
    isOpen,
    onClose,
    isLoading,
    error,
    filteredProducts,
    currentPage,
    totalPages,
    changePage,
  } = props;

  // [THE SYSTEMIC FIX] This useEffect hook controls the body scroll.
  // It's the definitive solution to the "Scroll Leakage" problem.
  useEffect(() => {
    if (isOpen) {
      // When the modal is open, disable scroll on the body.
      document.body.classList.add("overflow-hidden");
    } else {
      // When the modal is closed, re-enable scroll on the body.
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup function: This is crucial. It ensures that if the component
    // is ever unmounted while the modal is open, the class is removed.
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]); // This effect runs only when the `isOpen` prop changes.

  const hasProducts = filteredProducts.length > 0;
  const showContent = !isLoading && !error && hasProducts;

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="flex h-full w-full max-w-[1200px] flex-col rounded-2xl bg-white shadow-2xl md:h-auto md:max-h-[95vh] dark:bg-gray-900"
    >
      <ModalHeader />
      <div className="relative flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="flex flex-col gap-6">
          <FilterSection {...props} />
          {showContent && (
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                พบ{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {filteredProducts.length}
                </span>{" "}
                รายการ
              </div>
              <div className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                หน้า {currentPage} / {totalPages}
              </div>
            </div>
          )}
          <StatusDisplay
            isLoading={isLoading}
            error={error}
            hasProducts={hasProducts}
          />
          {showContent && (
            <>
              <ProductTable {...props} />
              <ProductCardGrid {...props} />
            </>
          )}
        </div>
        {showContent && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-gray-900" />
        )}
      </div>
      {showContent && (
        <ModalFooter
          currentPage={currentPage}
          totalPages={totalPages}
          changePage={changePage}
        />
      )}
    </Modal>
  );
}
