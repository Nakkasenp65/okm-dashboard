"use client";

// MARK: - Imports
import React from "react";
import { FaWrench, FaHandSparkles } from "react-icons/fa6";
import { Product } from "../../types/Pos";
import clsx from "clsx";

// MARK: - Props Interface
interface ConditionSelectionProps {
  onSelectCondition: (condition: Product["condition"]) => void;
  availableConditions: Product["condition"][];
}

// MARK: - Component Details Constant
// สร้าง Object เพื่อเก็บรายละเอียดการแสดงผลของแต่ละสภาพ
const conditionDetails: Record<
  Product["condition"],
  {
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    description: string;
    displayName: string;
    hoverClasses: string;
    iconColor: string;
  }
> = {
  new: {
    Icon: FaHandSparkles,
    description: "สินค้าใหม่แกะกล่อง",
    displayName: "มือหนึ่ง",
    hoverClasses: "hover:border-green-500 hover:shadow-green-500/25 dark:hover:border-green-400",
    iconColor: "text-green-500",
  },
  used: {
    Icon: FaWrench,
    description: "สินค้าผ่านการใช้งาน",
    displayName: "มือสอง",
    hoverClasses: "hover:border-yellow-500 hover:shadow-yellow-500/25 dark:hover:border-yellow-400",
    iconColor: "text-yellow-500",
  },
};

// MARK: - Main Component
export default function ConditionSelection({ onSelectCondition, availableConditions }: ConditionSelectionProps) {
  // ✅ KEY CHANGE: สร้างเงื่อนไขสำหรับ Class ของ Container
  // เพื่อปรับ Layout ตามจำนวนของ Condition ที่มี
  const containerClasses = clsx(
    "h-full p-2", // Class ร่วม
    {
      // ถ้ามีแค่ 1 รายการ: ใช้ Flexbox เพื่อจัดให้อยู่ตรงกลาง
      "flex items-center justify-center": availableConditions.length === 1,
      // ถ้ามีมากกว่า 1 รายการ: ใช้ Grid เหมือนเดิม
      "grid grid-cols-1 place-content-center gap-2 sm:grid-cols-2": availableConditions.length > 1,
    },
  );

  return (
    // Content: Condition Buttons
    <div className={containerClasses}>
      {availableConditions.map((condition) => {
        const details = conditionDetails[condition];
        if (!details) return null;

        const { Icon, description, displayName, hoverClasses, iconColor } = details;

        return (
          <button
            key={condition}
            onClick={() => onSelectCondition(condition)}
            className={clsx(
              "group flex flex-col items-center justify-center rounded-lg border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800",
              hoverClasses,
              // ✅ KEY CHANGE: ถ้ามีแค่ 1 รายการ ให้จำกัดความกว้างสูงสุดบนจอใหญ่
              // เพื่อไม่ให้ปุ่มดูกว้างจนเกินไป
              availableConditions.length === 1 && "w-full sm:max-w-lg",
            )}
          >
            {/* Part: Icon */}
            <Icon size={128} className={clsx("text-5xl transition-transform group-hover:scale-110", iconColor)} />
            {/* Part: Display Name */}
            <h3 className="mt-16 text-6xl font-bold text-gray-800 dark:text-gray-100">{displayName}</h3>
            {/* Part: Description */}
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          </button>
        );
      })}
    </div>
  );
}
