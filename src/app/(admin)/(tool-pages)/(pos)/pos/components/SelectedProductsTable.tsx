"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon, ChevronUpIcon } from "@/icons";

export interface PosItem {
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
}

// Extended item for sub-items with unique IDs
interface SubItem extends PosItem {
  subId: string; // unique identifier for each sub-item
}

interface SelectedProductsTableProps {
  items: PosItem[];
  onUpdateQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}

// Group items by product ID and name
interface GroupedItem {
  id: number;
  name: string;
  totalQty: number;
  totalPrice: number;
  subItems: SubItem[];
  category?: {
    id: number;
    color: string;
    name: string;
  };
  unit?: {
    id: number;
    name: string;
  };
}

export default function SelectedProductsTable({
  items,
  onUpdateQty,
  onRemove,
}: SelectedProductsTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (items.length === 0) {
    return null;
  }

  // Group items by product ID
  const groupedItems: GroupedItem[] = [];
  const itemMap = new Map<number, GroupedItem>();

  items.forEach((item, index) => {
    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, {
        id: item.id,
        name: item.name,
        totalQty: 0,
        totalPrice: 0,
        subItems: [],
        category: item.category,
        unit: item.unit,
      });
      groupedItems.push(itemMap.get(item.id)!);
    }

    const group = itemMap.get(item.id)!;
    const subItem: SubItem = {
      ...item,
      subId: `${item.id}-${index}`,
      qty: 1,
    };

    for (let i = 0; i < item.qty; i++) {
      group.subItems.push({ ...subItem, subId: `${item.id}-${index}-${i}` });
      group.totalQty += 1;
      group.totalPrice += item.unitPrice;
    }
  });

  // MOBILE CARD VIEW
  if (isMobile) {
    return (
      <div className="space-y-3">
        {groupedItems.map((group, idx) => {
          const isExpanded = expandedItems.has(group.id);
          const hasMultiple = group.subItems.length > 1;

          return (
            <div
              key={group.id}
              className={`rounded-lg p-4 transition-all ${
                idx % 2 === 0
                  ? "bg-white dark:bg-gray-950"
                  : "bg-gray-50 dark:bg-gray-900"
              }`}
            >
              {/* Main Card */}
              <div
                className="cursor-pointer"
                onClick={() => hasMultiple && toggleExpand(group.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {group.name}
                    </h3>
                    {hasMultiple && (
                      <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {group.subItems.length} รายการ
                      </span>
                    )}
                  </div>
                  {hasMultiple && (
                    <button className="p-1">
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Summary Info */}
                <div className="mt-3 space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      จำนวน
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {group.totalQty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ราคา
                    </span>
                    <span className="text-base font-bold text-green-600 dark:text-green-400">
                      ฿{group.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-3 flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="flex flex-1 items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => onUpdateQty(group.id, -1)}
                    >
                      −
                    </Button>
                    <span className="min-w-8 text-center font-bold">
                      {group.totalQty}
                    </span>
                    <Button
                      size="sm"
                      className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 p-0 hover:from-green-600 hover:to-emerald-700"
                      onClick={() => onUpdateQty(group.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      for (let i = 0; i < group.totalQty; i++) {
                        onRemove(group.id);
                      }
                    }}
                  >
                    🗑️ ลบ
                  </Button>
                </div>
              </div>

              {/* Expanded Sub-items */}
              {isExpanded && hasMultiple && (
                <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                  {group.subItems.map((subItem, subIdx) => (
                    <div
                      key={subItem.subId}
                      className="rounded bg-indigo-50 p-3 dark:bg-indigo-950/20"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          รายการที่ {subIdx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ฿{subItem.unitPrice.toFixed(2)}
                        </span>
                      </div>
                      {editingPrice === subItem.subId ? (
                        <div className="mt-2 flex gap-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="flex-1 rounded border border-blue-300 bg-white px-2 py-1 text-sm dark:border-blue-700 dark:bg-gray-800"
                          />
                          <button
                            onClick={() => saveEditPrice(subItem.subId)}
                            className="rounded bg-green-500 px-2 text-white hover:bg-green-600"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditPrice}
                            className="rounded bg-gray-400 px-2 text-white hover:bg-gray-500"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            startEditPrice(subItem.subId, subItem.unitPrice)
                          }
                          className="mt-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          ✏️ แก้ไขราคา
                        </button>
                      )}
                      <div className="mt-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => removeSubItem(group.id)}
                        >
                          ลบ
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const startEditPrice = (subId: string, currentPrice: number) => {
    setEditingPrice(subId);
    setTempPrice(currentPrice.toString());
  };

  const cancelEditPrice = () => {
    setEditingPrice(null);
    setTempPrice("");
  };

  const saveEditPrice = (subId: string) => {
    // This would need to be implemented with a new handler
    // For now, we'll just cancel the edit
    console.log("Save price for", subId, ":", tempPrice);
    cancelEditPrice();
  };

  const removeSubItem = (groupId: number) => {
    // Remove one instance by decreasing qty
    onUpdateQty(groupId, -1);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <TableCell isHeader className="w-12 py-3 text-center font-bold">
              {" "}
            </TableCell>
            <TableCell isHeader className="py-3 text-start font-bold">
              สินค้า
            </TableCell>
            <TableCell isHeader className="py-3 text-center font-bold">
              หมวดหมู่
            </TableCell>
            <TableCell
              isHeader
              className="hidden py-3 text-center font-bold sm:table-cell"
            >
              ราคา/หน่วย
            </TableCell>
            <TableCell isHeader className="py-3 text-center font-bold">
              จำนวน/หน่วย
            </TableCell>
            <TableCell isHeader className="py-3 text-end font-bold">
              รวม
            </TableCell>
            <TableCell isHeader className="py-3 text-center font-bold">
              จัดการ
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {groupedItems.map((group, idx) => {
            const isExpanded = expandedItems.has(group.id);
            const hasMultiple = group.subItems.length > 1;

            return (
              <React.Fragment key={group.id}>
                {/* Main Row */}
                <TableRow
                  className={`transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/20 ${
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-950"
                      : "bg-gray-50/50 dark:bg-gray-900/50"
                  }`}
                >
                  {/* Expand/Collapse Button */}
                  <TableCell className="py-3 text-center">
                    {hasMultiple && (
                      <button
                        onClick={() => toggleExpand(group.id)}
                        className="rounded-full p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    )}
                  </TableCell>

                  {/* Product Name */}
                  <TableCell className="py-3 font-medium text-gray-900 dark:text-white">
                    {group.name}
                    {hasMultiple && (
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {group.subItems.length} รายการ
                      </span>
                    )}
                  </TableCell>

                  {/* Category Badge */}
                  <TableCell className="py-3">
                    <div className="flex justify-center">
                      {group.category ? (
                        <span
                          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: group.category.color }}
                        >
                          {group.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          -
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Unit Price */}
                  <TableCell className="hidden py-3 text-center text-sm font-medium text-gray-700 sm:table-cell dark:text-gray-300">
                    ฿{(group.totalPrice / group.totalQty).toFixed(2)}
                  </TableCell>

                  {/* Unit Name + Quantity */}
                  <TableCell className="py-3">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => onUpdateQty(group.id, -1)}
                      >
                        −
                      </Button>
                      <span className="min-w-8 text-center font-bold text-gray-900 sm:min-w-10 dark:text-white">
                        {group.totalQty}
                      </span>
                      <Button
                        size="sm"
                        className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 p-0 hover:from-green-600 hover:to-emerald-700"
                        onClick={() => onUpdateQty(group.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>

                  {/* Total Price */}
                  <TableCell className="py-3 text-end text-base font-bold text-green-600 dark:text-green-400">
                    ฿{group.totalPrice.toFixed(2)}
                  </TableCell>

                  {/* Delete Button */}
                  <TableCell className="py-3 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="transition-all hover:shadow-md"
                      onClick={() => {
                        // Remove all items of this product
                        for (let i = 0; i < group.totalQty; i++) {
                          onRemove(group.id);
                        }
                      }}
                    >
                      🗑️
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Expanded Sub-Items */}
                {isExpanded && hasMultiple && (
                  <>
                    {group.subItems.map((subItem, subIdx) => (
                      <TableRow
                        key={subItem.subId}
                        className="bg-indigo-50/50 dark:bg-indigo-950/10"
                      >
                        {/* Empty cell for alignment */}
                        <TableCell className="py-2"> </TableCell>

                        {/* Sub-item indicator */}
                        <TableCell className="py-2 pl-8">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              └─
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              รายการที่ {subIdx + 1}
                            </span>
                          </div>
                        </TableCell>

                        {/* Quantity (always 1 for sub-items) */}
                        <TableCell className="py-2 text-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            1
                          </span>
                        </TableCell>

                        {/* Editable Price */}
                        <TableCell className="hidden py-2 text-end sm:table-cell">
                          {editingPrice === subItem.subId ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value)}
                                className="w-20 rounded border border-blue-300 bg-white px-2 py-1 text-sm dark:border-blue-700 dark:bg-gray-800"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEditPrice(subItem.subId)}
                                className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEditPrice}
                                className="rounded bg-gray-400 px-2 py-1 text-xs text-white hover:bg-gray-500"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                startEditPrice(subItem.subId, subItem.unitPrice)
                              }
                              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                            >
                              ฿{subItem.unitPrice.toFixed(2)} ✏️
                            </button>
                          )}
                        </TableCell>

                        {/* Sub-item Total (same as unit price since qty=1) */}
                        <TableCell className="py-2 text-end text-sm text-gray-700 dark:text-gray-300">
                          ฿{subItem.unitPrice.toFixed(2)}
                        </TableCell>

                        {/* Delete Sub-item */}
                        <TableCell className="py-2 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs transition-all hover:shadow-md"
                            onClick={() => removeSubItem(group.id)}
                          >
                            ลบ
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
