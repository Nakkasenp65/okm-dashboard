"use client";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { Product } from "../types/Pos";
import { DisplayOptions } from "./(modal)/DisplayOptionsModal";

// Props ที่ Component นี้ต้องการ
interface ProductDisplayProps {
  product: Product;
  displayOptions: DisplayOptions;
  onAddProduct: (product: Product) => void;
  isListMode?: boolean;
  availableStock: number;
}

export default function ProductDisplay({
  product,
  displayOptions,
  onAddProduct,
  isListMode = false,
  availableStock,
}: ProductDisplayProps) {
  const isOutOfStock = availableStock <= 0;
  if (isListMode) {
    return (
      <div
        className={`group relative flex overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
          isOutOfStock ? "opacity-50 grayscale" : ""
        }`}
      >
        {/* ส่วนรูปภาพ (ด้านซ้าย) */}
        {/* <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="p-2"
          />
        </div> */}

        {/* ส่วนรายละเอียดสินค้า (ตรงกลาง) */}
        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
              {product.name}
            </h4>

            {/* แสดง IMEI อย่างชัดเจนและโดดเด่น */}
            {displayOptions.showImei && (
              <div className="mt-2 rounded-md bg-gray-900 p-2 font-mono text-sm font-bold text-white dark:bg-black">
                IMEI: {product.barcode}
              </div>
            )}

            {/* แสดงผลข้อมูลอื่นๆ */}
            {displayOptions.showStock && (
              <p
                className={`mt-1 text-xs font-semibold ${
                  isOutOfStock ? "text-red-500" : "text-blue-500"
                }`}
              >
                คงเหลือ: {availableStock} ชิ้น
              </p>
            )}
          </div>

          {displayOptions.showPrice && (
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ฿{product.price.toLocaleString()}
            </p>
          )}
        </div>

        {/* ปุ่มเพิ่มลงตะกร้า (ด้านขวา) */}
        <button
          onClick={() => !isOutOfStock && onAddProduct(product)}
          disabled={isOutOfStock}
          className={`flex flex-shrink-0 flex-col items-center justify-center gap-1 px-4 py-3 text-white transition-colors ${
            isOutOfStock
              ? "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          <FaPlus size={16} />
          <span className="text-xs font-medium">
            {isOutOfStock ? "หมด" : "เพิ่ม"}
          </span>
        </button>
      </div>
    );
  }

  // Grid Mode (default)
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
        isOutOfStock ? "opacity-50 grayscale" : ""
      }`}
    >
      {/* TODO: รูปสินค้า */}
      {/* ส่วนรูปภาพ */}
      {/* <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          layout="fill"
          objectFit="contain"
          className="p-4"
        />
      </div> */}

      {/* ส่วนรายละเอียดสินค้า */}
      <div className="flex flex-1 flex-col p-4">
        {/* แสดง IMEI อย่างชัดเจนและโดดเด่น */}
        {displayOptions.showImei && (
          <div className="mt-2 rounded-md bg-gray-900 p-1 font-mono text-base font-bold text-white dark:bg-black">
            IMEI/SN: {product.barcode}
          </div>
        )}
        <h4 className="mt-2 flex-1 text-xl font-semibold text-gray-800 dark:text-gray-100">
          {product.name}
        </h4>

        {/* แสดง stock */}
        {displayOptions.showStock && (
          <p
            className={`mt-1 text-xs font-semibold ${
              isOutOfStock ? "text-red-500" : "text-blue-500"
            }`}
          >
            คงเหลือ: {availableStock} ชิ้น
          </p>
        )}

        {displayOptions.showPrice && (
          <p className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">
            ฿{product.price.toLocaleString()}
          </p>
        )}
      </div>

      {/* ปุ่มเพิ่มลงตะกร้า */}
      <button
        onClick={() => !isOutOfStock && onAddProduct(product)}
        disabled={isOutOfStock}
        className={`flex w-full items-center justify-center gap-2 p-3 text-white transition-colors ${
          isOutOfStock
            ? "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        <FaPlus /> <span>{isOutOfStock ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}</span>
      </button>
    </div>
  );
}
