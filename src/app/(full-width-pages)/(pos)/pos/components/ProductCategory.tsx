"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Product } from "../types/Pos";
import DisplayOptionsModal, {
  DisplayOptions,
} from "./(modal)/DisplayOptionsModal";

import CatalogControls from "./(product-catalog)/CatalogControls";
import BrandSelection from "./(product-catalog)/BrandSelection";
import ConditionSelection from "./(product-catalog)/ConditionSelection";
import ProductGrid from "./(product-catalog)/ProductGrid";

interface ProductCatalogProps {
  onAddProduct: (product: Product) => void;
  products: Product[];
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

export default function ProductCategory({
  onAddProduct,
  products,
  availableStock,
}: ProductCatalogProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<
    Product["condition"] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(
    DEFAULT_DISPLAY_OPTIONS,
  );
  const [isOptionsModalOpen, setOptionsModalOpen] = useState(false);

  useEffect(() => {
    const storedOptions = getDisplayOptionsFromStorage();
    setDisplayOptions(storedOptions);
  }, []);

  const brandsWithInfo = useMemo(() => {
    const relevantProducts = products.filter(
      (p) => p.condition === "มือหนึ่ง" || p.condition === "มือสอง",
    );
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
        // เพิ่มเฉพาะสภาพที่เกี่ยวข้อง (ไม่เอา อุปกรณ์เสริม)
        if (p.condition === "มือหนึ่ง" || p.condition === "มือสอง") {
          conditions.add(p.condition);
        }
      });

    // แปลง Set กลับเป็น Array เพื่อให้ map ได้ง่าย
    return Array.from(conditions);
  }, [products, selectedBrand]);

  const processedProducts = useMemo(() => {
    let filtered = products;

    if (selectedBrand) {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }
    if (selectedCondition) {
      filtered = filtered.filter((p) => p.condition === selectedCondition);
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerCaseQuery) ||
          p.barcode.toLowerCase().includes(lowerCaseQuery),
      );
    }

    const [field, direction] = sortOption.split("-");
    const sorted = [...filtered].sort((a, b) => {
      let compare = 0;
      switch (field) {
        case "price":
          compare = a.price - b.price;
          break;
        case "date":
          compare = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "name":
          compare = a.name.localeCompare(b.name);
          break;
        default:
          compare = a.barcode.localeCompare(b.barcode);
          break;
      }
      return direction === "asc" ? compare : -compare;
    });

    return sorted;
  }, [products, selectedBrand, selectedCondition, searchQuery, sortOption]);

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
        {!selectedBrand ? (
          <BrandSelection
            brands={brandsWithInfo}
            onSelectBrand={setSelectedBrand}
          />
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
            />
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
