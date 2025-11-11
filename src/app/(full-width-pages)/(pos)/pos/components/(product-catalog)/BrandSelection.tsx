"use client";
import React from "react";
import { FaApple, FaAndroid } from "react-icons/fa";

interface BrandSelectionProps {
  availableBrands: string[];
  onSelectBrand: (brand: string) => void;
}

export default function BrandSelection({
  availableBrands,
  onSelectBrand,
}: BrandSelectionProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
        เลือกแบรนด์
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {availableBrands.map((brand) => (
          <button
            key={brand}
            onClick={() => onSelectBrand(brand)}
            className="group flex flex-col items-center justify-center gap-3 rounded-lg border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
          >
            {brand === "Apple" ? (
              <FaApple className="h-12 w-12 text-gray-600 group-hover:text-black dark:text-gray-300 dark:group-hover:text-white" />
            ) : (
              <FaAndroid className="h-12 w-12 text-gray-600 group-hover:text-green-500 dark:text-gray-300" />
            )}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {brand}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
