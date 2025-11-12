"use client";
import React from "react";
import { FaWrench, FaHandSparkles } from "react-icons/fa6";
import { Product } from "../dataTransformer";
import clsx from "clsx";

// ✅ KEY CHANGE: ปรับปรุง Props Interface
interface ConditionSelectionProps {
  onSelectCondition: (condition: Product["condition"]) => void;
  availableConditions: Product["condition"][]; // รับลิสต์ของสภาพสินค้าที่มีอยู่จริง
}

// สร้าง Object เพื่อเก็บรายละเอียดการแสดงผลของแต่ละสภาพ
const conditionDetails = {
  มือหนึ่ง: {
    Icon: FaHandSparkles,
    description: "สินค้าใหม่แกะกล่อง",
    hoverClasses:
      "hover:border-green-500 hover:shadow-green-500/25 dark:hover:border-green-400",
    iconColor: "text-green-500",
  },
  มือสอง: {
    Icon: FaWrench,
    description: "สินค้าผ่านการใช้งาน",
    hoverClasses:
      "hover:border-yellow-500 hover:shadow-yellow-500/25 dark:hover:border-yellow-400",
    iconColor: "text-yellow-500",
  },
  อุปกรณ์เสริม: {
    // เผื่อไว้สำหรับอนาคต แต่ใน logic ปัจจุบันจะไม่ถูกแสดง
    Icon: FaWrench,
    description: "อุปกรณ์เสริมต่างๆ",
    hoverClasses:
      "hover:border-blue-500 hover:shadow-blue-500/25 dark:hover:border-blue-400",
    iconColor: "text-blue-500",
  },
};

export default function ConditionSelection({
  onSelectCondition,
  availableConditions, // นำ prop มาใช้งาน
}: ConditionSelectionProps) {
  // ✅ KEY CHANGE: สร้างปุ่มแบบไดนามิกจาก prop ที่ได้รับมา
  return (
    <div className="grid h-full grid-cols-1 place-content-center gap-2 p-2 sm:grid-cols-2">
      {availableConditions.map((condition) => {
        // ดึงรายละเอียดของสภาพนั้นๆ
        const details = conditionDetails[condition];
        // ถ้าไม่มีข้อมูล (เผื่อกรณีผิดพลาด) ให้ข้ามไป
        if (!details) return null;

        const { Icon, description, hoverClasses, iconColor } = details;

        return (
          <button
            key={condition}
            onClick={() => onSelectCondition(condition)}
            className={clsx(
              "group flex flex-col items-center justify-center rounded-lg border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800",
              hoverClasses, // ใช้คลาส hover แบบไดนามิก
            )}
          >
            <Icon
              size={128}
              className={clsx(
                "text-5xl transition-transform group-hover:scale-110",
                iconColor, // ใช้สีไอคอนแบบไดนามิก
              )}
            />
            <h3 className="mt-16 text-6xl font-bold text-gray-800 dark:text-gray-100">
              {condition}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          </button>
        );
      })}
    </div>
  );
}
