"use client";
import React, { useState } from "react";
import { SubItem } from "../page";
import Button from "@/components/ui/button/Button";

interface EditDetailsProps {
  items: SubItem[];
  onSave: (updatedItems: SubItem[]) => void;
  onCancel: () => void;
}

export default function EditDetails({
  items,
  onSave,
  onCancel,
}: EditDetailsProps) {
  const [editableItems, setEditableItems] = useState<SubItem[]>([
    ...items.map((item) => ({ ...item })),
  ]);

  // State สำหรับฟอร์มแก้ไขราคารวม/ทั้งหมด
  const [bulkPrice, setBulkPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const handlePriceChange = (uniqueId: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    setEditableItems((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId
          ? { ...item, unitPrice: isNaN(price) ? 0 : price }
          : item,
      ),
    );
  };

  const applyBulkPrice = () => {
    const price = parseFloat(bulkPrice);
    if (isNaN(price) || price < 0) return;
    setEditableItems((prev) =>
      prev.map((item) => ({ ...item, unitPrice: price })),
    );
    setBulkPrice("");
  };

  const applyTotalPrice = () => {
    const total = parseFloat(totalPrice);
    if (isNaN(total) || total < 0 || editableItems.length === 0) return;
    const pricePerItem = total / editableItems.length;
    setEditableItems((prev) =>
      prev.map((item) => ({ ...item, unitPrice: pricePerItem })),
    );
    setTotalPrice("");
  };

  return (
    <div className="rounded-b-lg bg-gray-100 p-4 dark:bg-gray-900/50">
      <div className="mb-4 space-y-3">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
          แก้ไขราคารายชิ้น
        </h4>
        {editableItems.map((item, index) => (
          <div key={item.uniqueId} className="flex items-center gap-2">
            <label className="w-20 shrink-0 text-sm">
              ชิ้นที่ {index + 1}:
            </label>
            <input
              type="number"
              value={item.unitPrice}
              onChange={(e) => handlePriceChange(item.uniqueId, e.target.value)}
              className="w-full rounded-md border-gray-300 p-1 dark:bg-gray-700"
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t pt-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
          แก้ไขราคารวม
        </h4>
        <div className="flex gap-2">
          <input
            type="number"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            placeholder="แก้ทุกชิ้นเป็นราคา..."
            className="w-full rounded-md p-1 dark:bg-gray-700"
          />
          <Button size="sm" onClick={applyBulkPrice}>
            ใช้
          </Button>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            placeholder="แก้ราคารวมเป็น..."
            className="w-full rounded-md p-1 dark:bg-gray-700"
          />
          <Button size="sm" onClick={applyTotalPrice}>
            ใช้
          </Button>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button size="sm" onClick={() => onSave(editableItems)}>
          บันทึกการแก้ไข
        </Button>
      </div>
    </div>
  );
}
