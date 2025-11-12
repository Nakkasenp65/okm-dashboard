"use client";
import React from "react";
import { BrandLogo } from "../../../../../../components/ui/images/BrandLogo";
import clsx from "clsx";

interface BrandInfo {
  brand: string;
  color?: string;
}

interface BrandSelectionProps {
  brands: BrandInfo[];
  onSelectBrand: (brand: string) => void;
}

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

export default function BrandSelection({
  brands,
  onSelectBrand,
}: BrandSelectionProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
        เลือกแบรนด์
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {brands.map(({ brand, color }) => {
          const lowerCaseBrand = brand.toLowerCase();

          const hoverBgColor =
            brandSpecificColors[lowerCaseBrand] || color || "#4B5563"; // Gray-600

          return (
            <button
              key={brand}
              onClick={() => onSelectBrand(brand)}
              className={clsx(
                "group flex flex-col items-center justify-center gap-3 rounded-lg border p-6 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:border-transparent hover:text-white hover:shadow-lg dark:border-gray-700 dark:bg-gray-800",
                "hover:bg-[var(--brand-color)]", // ใช้ตัวแปร --brand-color ที่กำหนดใน style
              )}
              // เรากำหนด CSS Variable ที่ชื่อว่า --brand-color ตรงนี้
              style={{ "--brand-color": hoverBgColor } as React.CSSProperties}
            >
              <BrandLogo
                brand={brand}
                color={color}
                className="h-12 w-12 text-gray-600 duration-100 group-hover:text-white dark:text-gray-300"
              />
              <span className="font-semibold text-gray-800 duration-100 group-hover:text-white dark:text-gray-100">
                {brand}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
