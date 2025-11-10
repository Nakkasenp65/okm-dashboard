"use client";
import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaPencilAlt,
  FaRegTrashAlt,
} from "react-icons/fa";
import { GroupedProduct, SubItem } from "../page";
import EditDetails from "./EditDetails";

interface SelectedProductComponentProps {
  group: GroupedProduct;
  onUpdate: (productId: number, updatedItems: SubItem[]) => void;
}

export default function SelectedProductComponent({
  group,
  onUpdate,
}: SelectedProductComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const totalQty = group.items.length;
  const totalPrice = group.items.reduce((sum, item) => sum + item.unitPrice, 0);

  const handleRemoveAll = () => {
    if (
      window.confirm(
        `ต้องการลบ "${group.name}" ทั้งหมด ${totalQty} ชิ้นหรือไม่?`,
      )
    ) {
      onUpdate(group.productId, []);
    }
  };

  const handleRemoveSubItem = (uniqueIdToRemove: string) => {
    const updatedItems = group.items.filter(
      (item) => item.uniqueId !== uniqueIdToRemove,
    );
    onUpdate(group.productId, updatedItems);
  };

  const handleSaveChanges = (updatedItems: SubItem[]) => {
    onUpdate(group.productId, updatedItems);
    setIsEditing(false); // ปิดโหมดแก้ไขหลังบันทึก
  };

  // ถ้ากำลังแก้ไข ให้แสดงหน้า EditDetails ทันที
  if (isEditing) {
    return (
      <EditDetails
        items={group.items}
        onSave={handleSaveChanges}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="border-b border-gray-100 dark:border-gray-700/50">
      {/* Main Row */}
      <div
        className="flex cursor-pointer items-center gap-2 py-3"
        onClick={() => totalQty > 1 && setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {group.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @{(totalPrice / totalQty).toFixed(2)} (เฉลี่ย)
          </p>
        </div>
        <div className="w-16 text-center text-sm font-bold">{totalQty}</div>
        <div className="w-24 text-right font-semibold">
          {totalPrice.toFixed(2)}
        </div>
        <div className="flex w-16 items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaPencilAlt />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveAll();
            }}
            className="text-red-500 hover:text-red-700"
          >
            <FaRegTrashAlt />
          </button>
          {totalQty > 1 && (isExpanded ? <FaChevronUp /> : <FaChevronDown />)}
        </div>
      </div>

      {/* Expanded Sub-items */}
      {isExpanded && totalQty > 1 && (
        <div className="bg-gray-50 pl-6 dark:bg-gray-800/30">
          {group.items.map((item, index) => (
            <div
              key={item.uniqueId}
              className="flex items-center border-t py-1 text-sm dark:border-gray-700"
            >
              <p className="flex-1">ชิ้นที่ {index + 1}</p>
              <p className="w-24 pr-2 text-right">
                {item.unitPrice.toFixed(2)}
              </p>
              <button
                onClick={() => handleRemoveSubItem(item.uniqueId)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <FaRegTrashAlt size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
