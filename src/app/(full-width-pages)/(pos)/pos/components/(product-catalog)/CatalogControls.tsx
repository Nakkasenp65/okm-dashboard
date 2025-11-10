"use client";
import React from "react";
import { FaSearch, FaSort, FaCog, FaThLarge, FaList } from "react-icons/fa";

interface CatalogControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  displayMode: "grid" | "list";
  onChangeDisplayMode: (mode: "grid" | "list") => void;
  onOpenOptionsModal: () => void;
}

export default function CatalogControls({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  displayMode,
  onChangeDisplayMode,
  onOpenOptionsModal,
}: CatalogControlsProps) {
  return (
    <div className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อ หรือ IMEI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border-gray-300 p-2 pl-10 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div className="relative md:col-span-1">
          <FaSort className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full appearance-none rounded-md border-gray-300 p-2 pl-10 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="date-desc">วันที่เพิ่ม: ล่าสุด</option>
            <option value="date-asc">วันที่เพิ่ม: เก่าสุด</option>
            <option value="price-asc">ราคา: น้อยไปมาก</option>
            <option value="price-desc">ราคา: มากไปน้อย</option>
            <option value="name-asc">ชื่อ: A-Z</option>
            <option value="name-desc">ชื่อ: Z-A</option>
            <option value="imei-asc">IMEI: A-Z</option>
          </select>
        </div>
        <div className="flex gap-2 md:col-span-1">
          {/* Display Mode Toggle Buttons */}
          <button
            onClick={() => onChangeDisplayMode("grid")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-2 transition-all ${
              displayMode === "grid"
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500"
            }`}
            title="โหมด Grid"
          >
            <FaThLarge size={16} />
          </button>
          <button
            onClick={() => onChangeDisplayMode("list")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-2 transition-all ${
              displayMode === "list"
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500"
            }`}
            title="โหมด List"
          >
            <FaList size={16} />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenOptionsModal}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 p-2 text-gray-600 transition-all hover:border-gray-400 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500"
            title="ตัวเลือกการแสดงผล"
          >
            <FaCog size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
