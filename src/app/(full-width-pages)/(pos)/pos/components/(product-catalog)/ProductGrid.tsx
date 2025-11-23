"use client";
import React from "react";
import { Product } from "../../types/Pos";
import { DisplayOptions } from "../(modal)/DisplayOptionsModal";
import ProductDisplay from "./ProductDisplay";

interface ProductGridProps {
  products: Product[];
  displayOptions: DisplayOptions;
  onAddProduct: (product: Product) => void;
  availableStock: Map<number, number>;
  isAdding?: boolean;
  addingProductId?: string;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export default function ProductGrid({
  products,
  displayOptions,
  onAddProduct,
  availableStock,
  isAdding,
  addingProductId,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
}: ProductGridProps) {
  // Pagination component
  const PaginationControls = () => {
    if (!onPageChange || totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          แสดง {products.length} รายการ จากทั้งหมด {totalItems} รายการ
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            ← ก่อนหน้า
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`rounded-md px-3 py-1 text-sm ${page === currentPage
                ? "bg-blue-600 text-white dark:bg-blue-500"
                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            ถัดไป →
          </button>
        </div>
      </div>
    );
  };
  if (displayOptions.displayMode === "list") {
    return (
      <div className="space-y-2">
        {products.length > 0 ? (
          <>
            {products.map((product) => (
              <ProductDisplay
                key={product.id}
                product={product}
                displayOptions={displayOptions}
                onAddProduct={onAddProduct}
                isListMode={true}
                availableStock={availableStock.get(product.id) || 0}
                isAdding={isAdding}
                addingProductId={addingProductId}
              />
            ))}
            <PaginationControls />
          </>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
          </div>
        )}
      </div>
    );
  }

  // Grid Mode (default)
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductDisplay
              key={product.id}
              product={product}
              displayOptions={displayOptions}
              onAddProduct={onAddProduct}
              isListMode={false}
              availableStock={availableStock.get(product.id) || 0}
              isAdding={isAdding}
              addingProductId={addingProductId}
            />
          ))
        ) : (
          <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
          </div>
        )}
      </div>
      {products.length > 0 && <PaginationControls />}
    </div>
  );
}
