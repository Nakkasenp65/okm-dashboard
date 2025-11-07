"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SellingDetails from "./components/SellingDetails";
import SellingAction from "./components/SellingAction";
import React, { useState } from "react";

// Note: metadata export is not allowed in client components.

// Types for selected cart items
type SelectedItem = {
  id: number;
  name: string;
  unitPrice: number;
  qty: number;
  category?: {
    id: number;
    color: string;
    name: string;
  };
  unit?: {
    id: number;
    name: string;
  };
  barcode?: string;
};

export default function Page() {
  // Selected products state
  const [selectedProducts, setSelectedProducts] = useState<SelectedItem[]>([]);

  return (
    <div id="pos-page-container" className="min-h-screen">
      <div id="pos-page-header">
        <PageBreadcrumb pageTitle="ระบบ POS" />
      </div>

      <div id="pos-page-content" className="">
        <div id="pos-main-grid" className="grid grid-cols-12 gap-4">
          {/* Selling Details */}
          <div
            id="pos-selling-details-section"
            className="col-span-12 lg:col-span-8"
          >
            <SellingDetails
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />
          </div>

          {/* Selling Action */}
          <div
            id="pos-selling-action-section"
            className="col-span-12 flex w-full flex-col gap-4 lg:col-span-4"
          >
            <SellingAction
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
