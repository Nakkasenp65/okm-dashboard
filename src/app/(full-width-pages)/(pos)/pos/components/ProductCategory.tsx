"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Product } from "../types/Pos";
import DisplayOptionsModal, { DisplayOptions } from "./(modal)/DisplayOptionsModal";
import { useProducts } from "../hooks/useProduct";

import CatalogControls from "./(product-catalog)/CatalogControls";
import BrandSelection from "./(product-catalog)/BrandSelection";
import ConditionSelection from "./(product-catalog)/ConditionSelection";
import ProductGrid from "./(product-catalog)/ProductGrid";

interface ProductCatalogProps {
  onAddProduct: (product: Product) => void;
  availableStock: Map<number, number>;
}

// Constants for localStorage
const DISPLAY_OPTIONS_STORAGE_KEY = "pos_display_options";
const DEFAULT_DISPLAY_OPTIONS: DisplayOptions = {
  showImei: true,
  showPrice: true,
  showStock: false,
  displayMode: "grid",
};

// Helper function to get display options from localStorage
const getDisplayOptionsFromStorage = (): DisplayOptions => {
  if (typeof window === "undefined") {
    return DEFAULT_DISPLAY_OPTIONS;
  }
  try {
    const stored = localStorage.getItem(DISPLAY_OPTIONS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_DISPLAY_OPTIONS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error reading display options from localStorage:", error);
  }
  return DEFAULT_DISPLAY_OPTIONS;
};

// Helper function to save display options to localStorage
const saveDisplayOptionsToStorage = (options: DisplayOptions): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISPLAY_OPTIONS_STORAGE_KEY, JSON.stringify(options));
  } catch (error) {
    console.error("Error saving display options to localStorage:", error);
  }
};

export default function ProductCategory({ onAddProduct, availableStock }: ProductCatalogProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<Product["condition"] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(DEFAULT_DISPLAY_OPTIONS);
  const [isOptionsModalOpen, setOptionsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Parse sort option for API
  const [sortField, sortDirection] = sortOption.split("-") as [string, "asc" | "desc"];

  // Map frontend sort field to API field
  const apiSortBy = sortField === "date" ? "created_at" : sortField === "price" ? "prices.level_1" : sortField;

  // Fetch products from API
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useProducts({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: searchQuery,
    sortBy: apiSortBy,
    sortOrder: sortDirection,
  });

  // Memoize products to prevent unnecessary re-renders
  const products = useMemo(() => apiResponse?.products || [], [apiResponse?.products]);
  const pagination = apiResponse?.pagination;

  useEffect(() => {
    const storedOptions = getDisplayOptionsFromStorage();
    setDisplayOptions(storedOptions);
  }, []);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption]);

  // Filter products for brand selection (client-side filtering by condition)
  const brandsWithInfo = useMemo(() => {
    // กรองเฉพาะสินค้าที่เป็น new หรือ used (ไม่รวมอุปกรณ์เสริม ถ้ามี)
    const relevantProducts = products.filter((p) => p.condition === "new" || p.condition === "used");
    const brandsMap = new Map<string, { color?: string }>();
    relevantProducts.forEach((product) => {
      if (!brandsMap.has(product.brand)) {
        brandsMap.set(product.brand, { color: product.categoryColor });
      }
    });
    return Array.from(brandsMap.entries()).map(([brand, data]) => ({
      brand,
      color: data.color,
    }));
  }, [products]);

  // ✅ KEY CHANGE: สร้าง useMemo เพื่อคำนวณสภาพสินค้าที่มีอยู่สำหรับแบรนด์ที่เลือก
  const availableConditionsForBrand = useMemo(() => {
    if (!selectedBrand) return [];

    // ใช้ Set เพื่อเก็บค่าที่ไม่ซ้ำกัน
    const conditions = new Set<Product["condition"]>();
    products
      .filter((p) => p.brand === selectedBrand) // กรองสินค้าตามแบรนด์ที่เลือก
      .forEach((p) => {
        // เพิ่มเฉพาะสภาพ new และ used
        if (p.condition === "new" || p.condition === "used") {
          conditions.add(p.condition);
        }
      });

    // แปลง Set กลับเป็น Array เพื่อให้ map ได้ง่าย
    return Array.from(conditions);
  }, [products, selectedBrand]);

  // Client-side filtering for brand and condition (after API search/sort)
  const processedProducts = useMemo(() => {
    let filtered = products;

    if (selectedBrand) {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }
    if (selectedCondition) {
      filtered = filtered.filter((p) => p.condition === selectedCondition);
    }

    return filtered;
  }, [products, selectedBrand, selectedCondition]);

  const handleBack = () => {
    if (selectedCondition) setSelectedCondition(null);
    else if (selectedBrand) setSelectedBrand(null);
  };

  const handleSaveDisplayOptions = (newOptions: DisplayOptions) => {
    setDisplayOptions(newOptions);
    saveDisplayOptionsToStorage(newOptions);
  };

  const handleChangeDisplayMode = (mode: "grid" | "list") => {
    setDisplayOptions((prev) => {
      const updated = { ...prev, displayMode: mode };
      saveDisplayOptionsToStorage(updated);
      return updated;
    });
  };

  return (
    <div className="flex h-full w-full flex-col rounded-lg bg-gray-50 dark:bg-gray-900">
      <div className="shrink-0 p-4">
        <div className="flex items-center gap-2">
          {selectedBrand && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <FaArrowLeft /> ย้อนกลับ
            </button>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span
              className="cursor-pointer hover:underline"
              onClick={() => {
                setSelectedBrand(null);
                setSelectedCondition(null);
              }}
            >
              หน้าแรก
            </span>
            {selectedBrand && ` / ${selectedBrand}`}
            {selectedCondition && ` / ${selectedCondition}`}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-4xl">⏳</div>
              <p className="text-lg text-gray-600 dark:text-gray-400">กำลังโหลดสินค้า...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-950/30">
              <div className="mb-2 text-4xl">❌</div>
              <p className="text-lg text-red-600 dark:text-red-400">
                เกิดข้อผิดพลาด: {error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้"}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {!selectedBrand ? (
              <BrandSelection brands={brandsWithInfo} onSelectBrand={setSelectedBrand} />
            ) : !selectedCondition ? (
              // ✅ KEY CHANGE: ส่ง prop `availableConditions` ไปให้ Component
              <ConditionSelection
                onSelectCondition={setSelectedCondition}
                availableConditions={availableConditionsForBrand}
              />
            ) : (
              <>
                <CatalogControls
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                  displayMode={displayOptions.displayMode}
                  onChangeDisplayMode={handleChangeDisplayMode}
                  onOpenOptionsModal={() => setOptionsModalOpen(true)}
                />
                <ProductGrid
                  products={processedProducts}
                  displayOptions={displayOptions}
                  onAddProduct={onAddProduct}
                  availableStock={availableStock}
                  // Pagination props
                  currentPage={currentPage}
                  totalPages={pagination?.totalPages || 1}
                  totalItems={pagination?.totalProducts || 0}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        )}
      </div>

      <DisplayOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setOptionsModalOpen(false)}
        initialOptions={displayOptions}
        onSave={handleSaveDisplayOptions}
      />
    </div>
  );
}
