"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Product } from "./dataTransformer";
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

  // Load display options from localStorage on component mount
  useEffect(() => {
    const storedOptions = getDisplayOptionsFromStorage();
    setDisplayOptions(storedOptions);
  }, []);

  const availableBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand));
    return Array.from(brands);
  }, [products]);

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
      {/* --- Breadcrumb / Header --- */}
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

      {/* --- Main Content Area --- */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* 2. Conditionally render the new child components */}
        {!selectedBrand ? (
          <BrandSelection
            availableBrands={availableBrands}
            onSelectBrand={setSelectedBrand}
          />
        ) : !selectedCondition ? (
          <ConditionSelection onSelectCondition={setSelectedCondition} />
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

      {/* --- Modal --- */}
      <DisplayOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setOptionsModalOpen(false)}
        initialOptions={displayOptions}
        onSave={handleSaveDisplayOptions}
      />
    </div>
  );
}
