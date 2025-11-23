"use client";

// MARK: - Imports
import React, { useMemo, useState } from "react"; // เพิ่ม useState
import Image from "next/image";
import { FaPlus } from "react-icons/fa";
import clsx from "clsx";
import { Product } from "../../types/Pos";
import { DisplayOptions } from "../(modal)/DisplayOptionsModal";
import ImageZoomModal from "../(modal)/ImageZoomModal"; // Import Modal ที่สร้างขึ้นใหม่

// MARK: - Props Interface
interface ProductDisplayProps {
  product: Product;
  displayOptions: DisplayOptions;
  onAddProduct: (product: Product) => void;
  isListMode?: boolean;
  availableStock: number;
  isAdding?: boolean;
  addingProductId?: string;
}

// MARK: - Main Component
export default function ProductDisplay({
  product,
  displayOptions,
  onAddProduct,
  isListMode = false,
  availableStock,
  isAdding = false,
  addingProductId,
}: ProductDisplayProps) {
  // Section: State Management
  // State สำหรับควบคุมการเปิด/ปิด Modal รูปภาพ
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Section: Memoized Values
  const imageUrl = useMemo(() => product.image1 ?? product.imageApi, [product.image1, product.imageApi]);
  const isOutOfStock = availableStock <= 0;

  // Check if this specific product is being added
  const isThisProductAdding = isAdding && addingProductId === product._id;

  // Section: Event Handlers
  const handleAddToCart = () => {
    if (!isOutOfStock) {
      onAddProduct(product);
    }
  };

  // ฟังก์ชันสำหรับเปิด Modal
  const openImageModal = () => {
    if (imageUrl) {
      setIsModalOpen(true);
    }
  };

  // ฟังก์ชันสำหรับปิด Modal
  const closeImageModal = () => {
    setIsModalOpen(false);
  };

  // Section: Render Logic
  // Render based on display mode


  if (isListMode) {
    return (
      <>
        <div
          className={clsx(
            "group relative flex overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800",
            isOutOfStock && "opacity-50 grayscale",
          )}
        >
          {/* Part: Product Image */}
          {imageUrl && (
            <div
              className="relative h-24 w-24 flex-shrink-0 hover:cursor-zoom-in"
              onClick={openImageModal} // เพิ่ม onClick เพื่อเปิด Modal
            >
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "contain" }}
                className="p-2"
              />
            </div>
          )}

          {/* Part: Product Details */}
          <div className="flex flex-1 flex-col justify-between p-3">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{product.name}</h4>
              {displayOptions.showImei && (
                <p className="mt-1 rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  IMEI: {product.barcode}
                </p>
              )}
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</span>
                <span
                  className={`text-sm font-medium ${(product.availablequantity || 0) > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                >
                  {(product.availablequantity || 0) > 0 ? `มีสินค้า ${product.availablequantity}` : "สินค้าหมด"}
                </span>
              </div>
              {displayOptions.showStock && (
                <p className={clsx("mt-1 text-xs font-semibold", isOutOfStock ? "text-red-500" : "text-blue-500")}>
                  คงเหลือ: {availableStock} ชิ้น
                </p>
              )}
            </div>
            {displayOptions.showPrice && (
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ฿{Number(product.prices?.level_1 || 0).toLocaleString()}
              </p>
            )}
          </div>

          {/* Part: Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isThisProductAdding}
            className={clsx(
              "flex flex-shrink-0 flex-col items-center justify-center gap-1 px-4 py-3 text-white transition-colors",
              isOutOfStock || isThisProductAdding
                ? "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
                : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none",
            )}
            aria-label={`เพิ่ม ${product.name} ลงในตะกร้า`}
          >
            <FaPlus size={16} />
            <span className="text-xs font-medium">
              {isOutOfStock ? "หมด" : isThisProductAdding ? "..." : "เพิ่ม"}
            </span>
          </button>
        </div>
        {/* Render Modal: แสดง Modal เมื่อ isModalOpen เป็น true */}
        {imageUrl && (
          <ImageZoomModal isOpen={isModalOpen} onClose={closeImageModal} imageUrl={imageUrl} altText={product.name} />
        )}
      </>
    );
  }

  // Grid Mode (default)
  return (
    <>
      <div
        className={clsx(
          "group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800",
          isOutOfStock && "opacity-50 grayscale",
        )}
      >
        {/* Part: Product Image */}
        <div
          className="relative h-40 w-full hover:cursor-zoom-in"
          onClick={openImageModal} // เพิ่ม onClick เพื่อเปิด Modal
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "contain" }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
              <p className="text-sm text-gray-400">No Image</p>
            </div>
          )}
        </div>

        {/* Part: Product Details */}
        <div className="flex flex-1 flex-col p-4">
          <h4 className="flex-1 text-lg font-semibold text-gray-800 dark:text-gray-100">{product.name}</h4>
          {displayOptions.showImei && (
            <p className="mt-2 rounded-md font-mono text-xl text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              IMEI/SN: {product.barcode}
            </p>
          )}
          <div className="mt-2 flex items-baseline justify-between">
            {displayOptions.showPrice && (
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                ฿{Number(product.prices?.level_1 || 0).toLocaleString()}
              </p>
            )}
            {displayOptions.showStock && (
              <p className={clsx("text-base font-semibold", isOutOfStock ? "text-red-500" : "text-blue-500")}>
                {availableStock} ชิ้น
              </p>
            )}
          </div>
        </div>

        {/* Part: Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isThisProductAdding}
          className={clsx(
            "flex w-full items-center justify-center gap-2 p-3 font-semibold text-white transition-colors",
            isOutOfStock || isThisProductAdding
              ? "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
              : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none",
          )}
          aria-label={`เพิ่ม ${product.name} ลงในตะกร้า`}
        >
          <FaPlus /> <span>{isOutOfStock ? "สินค้าหมด" : isThisProductAdding ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}</span>
        </button>
      </div>

      {/* Render Modal: แสดง Modal เมื่อ isModalOpen เป็น true */}
      {imageUrl && (
        <ImageZoomModal isOpen={isModalOpen} onClose={closeImageModal} imageUrl={imageUrl} altText={product.name} />
      )}
    </>
  );
}
