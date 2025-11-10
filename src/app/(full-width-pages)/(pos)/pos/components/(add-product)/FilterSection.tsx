"use client";

import React from "react";
import Button from "@/components/ui/button/Button";

type SortField = "name" | "price" | "category";

interface FilterSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  isLoading: boolean;
  categories: Array<{ id: number; name: string; color: string }>;
  onRefresh: () => void;
  onResetFilters: () => void;
}

export default function FilterSection({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  pageSize,
  setPageSize,
  sortField,
  setSortField,
  isLoading,
  categories,
  onRefresh,
  onResetFilters,
}: FilterSectionProps) {
  // Mock data for mobile shop filters
  const brands = [
    "Apple",
    "Samsung",
    "Xiaomi",
    "OPPO",
    "Vivo",
    "Huawei",
    "Realme",
    "OnePlus",
    "Sony",
    "AirPods",
    "JBL",
    "Sony Audio",
  ];

  const productTypes = [
    { value: "mobile", label: "📱 มือถือ" },
    { value: "headphone", label: "🎧 หูฟัง" },
    { value: "accessory", label: "🔌 อุปกรณ์เสริม" },
    { value: "smartwatch", label: "⌚ นาฬิกาอัจฉริยะ" },
    { value: "tablet", label: "📲 แท็บเล็ต" },
  ];

  const conditions = [
    { value: "new", label: "🆕 มือ 1 (ใหม่)", color: "text-green-600" },
    { value: "used", label: "♻️ มือ 2 (มือสอง)", color: "text-blue-600" },
  ];

  const [selectedBrand, setSelectedBrand] = React.useState<string>("");
  const [selectedProductType, setSelectedProductType] =
    React.useState<string>("");
  const [selectedCondition, setSelectedCondition] = React.useState<string>("");

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    sortField !== "name" ||
    selectedBrand ||
    selectedProductType ||
    selectedCondition;

  const handleResetFilters = () => {
    setSelectedBrand("");
    setSelectedProductType("");
    setSelectedCondition("");
    onResetFilters();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 dark:border-gray-700 dark:from-gray-900/30 dark:to-blue-950/20">
      <div className="mb-4 flex items-center justify-between">
        <h5 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200">
          <span className="text-2xl">🔍</span>
          ตัวกรองสินค้า
        </h5>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-200 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            ↻ รีเซ็ตทั้งหมด
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Search Box */}
        <div className="xl:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            🔎 ค้นหาชื่อสินค้า
          </label>
          <input
            type="text"
            placeholder="ค้นหา iPhone, Galaxy, AirPods..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2.5 text-sm font-medium transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400"
          />
        </div>

        {/* Product Type */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            📦 ประเภทสินค้า
          </label>
          <select
            value={selectedProductType}
            onChange={(e) => setSelectedProductType(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">ทั้งหมด</option>
            {productTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            🏷️ แบรนด์
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">ทุกแบรนด์</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            ✨ สภาพสินค้า
          </label>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">ทุกสภาพ</option>
            {conditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            📂 หมวดหมู่
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
            }}
            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">ทั้งหมด</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Second Row - Sort & Display Options */}
      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-700">
        {/* Page Size */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            📊 แสดงต่อหน้า
          </label>
          <select
            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            <option value={10}>10 รายการ</option>
            <option value={25}>25 รายการ</option>
            <option value={50}>50 รายการ</option>
            <option value={100}>100 รายการ</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            ⬇️ เรียงลำดับ
          </label>
          <select
            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
          >
            <option value="name">ชื่อสินค้า (A-Z)</option>
            <option value="price">ราคา (ต่ำ-สูง)</option>
            <option value="category">หมวดหมู่</option>
          </select>
        </div>

        {/* Refresh Button */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            🔄 รีเฟรชข้อมูล
          </label>
          <Button
            variant="outline"
            className="w-full border-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-sm font-semibold hover:from-blue-100 hover:to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span> กำลังโหลด...
              </>
            ) : (
              <>↻ รีเฟรชสินค้า</>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
          <div className="mb-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
            ตัวกรองที่เลือก:
          </div>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                🔎 &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1 hover:text-blue-900"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedProductType && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                📦{" "}
                {
                  productTypes.find((t) => t.value === selectedProductType)
                    ?.label
                }
                <button
                  onClick={() => setSelectedProductType("")}
                  className="ml-1 hover:text-purple-900"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedBrand && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/50 dark:text-green-300">
                🏷️ {selectedBrand}
                <button
                  onClick={() => setSelectedBrand("")}
                  className="ml-1 hover:text-green-900"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedCondition && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">
                ✨{" "}
                {conditions.find((c) => c.value === selectedCondition)?.label}
                <button
                  onClick={() => setSelectedCondition("")}
                  className="ml-1 hover:text-yellow-900"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
                📂{" "}
                {categories.find((c) => c.id.toString() === selectedCategory)
                  ?.name || "หมวดหมู่"}
                <button
                  onClick={() => setSelectedCategory("")}
                  className="ml-1 hover:text-pink-900"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
