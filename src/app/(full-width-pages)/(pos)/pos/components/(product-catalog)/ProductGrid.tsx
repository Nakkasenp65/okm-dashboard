"use client";
import React from "react";
import { Product } from "../dataTransformer";
import { DisplayOptions } from "../(modal)/DisplayOptionsModal";
import ProductDisplay from "../ProductDisplay";

interface ProductGridProps {
  products: Product[];
  displayOptions: DisplayOptions;
  onAddProduct: (product: Product) => void;
}

export default function ProductGrid({
  products,
  displayOptions,
  onAddProduct,
}: ProductGridProps) {
  if (displayOptions.displayMode === "list") {
    return (
      <div className="space-y-2">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductDisplay
              key={product.id}
              product={product}
              displayOptions={displayOptions}
              onAddProduct={onAddProduct}
              isListMode={true}
            />
          ))
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              ไม่พบสินค้าที่ตรงกับเงื่อนไข
            </p>
          </div>
        )}
      </div>
    );
  }

  // Grid Mode (default)
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductDisplay
            key={product.id}
            product={product}
            displayOptions={displayOptions}
            onAddProduct={onAddProduct}
            isListMode={false}
          />
        ))
      ) : (
        <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            ไม่พบสินค้าที่ตรงกับเงื่อนไข
          </p>
        </div>
      )}
    </div>
  );
}
