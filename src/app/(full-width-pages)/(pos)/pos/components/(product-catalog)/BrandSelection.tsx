"use client";

// MARK: - Imports
import React from "react";
import { BrandLogo } from "../../../../../../components/ui/images/BrandLogo";
import clsx from "clsx";

// MARK: - Props Interface
interface BrandInfo {
  brand: string;
  color?: string;
}

interface BrandSelectionProps {
  brands: BrandInfo[];
  onSelectBrand: (brand: string) => void;
}

// MARK: - Brand Colors Constant
const brandSpecificColors: { [key: string]: string } = {
  apple: "#000000",
  xiaomi: "#FF6900",
  google: "#4285F4",
  samsung: "#1428A0",
  vivo: "#415FFF",
  oppo: "#2D683D",
  realme: "#FFC916",
  huawei: "#FF0000",
  nokia: "#005AFF",
  oneplus: "#F5010C",
  infinix: "#64ff00",
};

// MARK: - Main Component
export default function BrandSelection({ brands, onSelectBrand }: BrandSelectionProps) {
  return (
    <div>
      {/* Header: Section Title */}
      <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">เลือกแบรนด์</h2>

      {/* Content: Grid of Brand Buttons */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {brands.map(({ brand, color }) => {
          const lowerCaseBrand = brand.toLowerCase();
          const hoverBgColor = brandSpecificColors[lowerCaseBrand] || color || "#4B5563"; // Gray-600

          return (
            <button
              key={brand}
              onClick={() => onSelectBrand(brand)}
              className={clsx(
                "group flex flex-col items-center justify-center gap-3 rounded-lg border p-8 shadow-sm transition-all duration-200 ease-in-out hover:border-transparent hover:text-white hover:shadow-lg dark:border-gray-700 dark:bg-gray-800",
                "hover:bg-[var(--brand-color)]",
              )}
              style={{ "--brand-color": hoverBgColor } as React.CSSProperties}
            >
              {/* Part: Brand Logo */}
              <BrandLogo
                brand={brand}
                color={color}
                // KEY CHANGE: เพิ่มขนาดโลโก้ให้ใหญ่ขึ้น
                className="h-24 w-24 text-gray-600 duration-100 group-hover:text-white dark:text-gray-300"
              />
              {/* Part: Brand Name */}
              <span className="text-lg font-semibold text-gray-800 duration-100 group-hover:text-white dark:text-gray-100">
                {brand}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
