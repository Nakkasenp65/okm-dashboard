"use client";
import React from "react";
import { FaWrench, FaHandSparkles } from "react-icons/fa6";
import { Product } from "../dataTransformer";

interface ConditionSelectionProps {
  onSelectCondition: (condition: Product["condition"]) => void;
}

export default function ConditionSelection({
  onSelectCondition,
}: ConditionSelectionProps) {
  return (
    <div className="grid h-full grid-cols-1 place-content-center gap-2 p-2 sm:grid-cols-2">
      <button
        onClick={() => onSelectCondition("มือหนึ่ง")}
        className="group flex flex-col items-center justify-center rounded-lg border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:border-green-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-400"
      >
        <FaHandSparkles className="text-5xl text-green-500 transition-transform group-hover:scale-110" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
          มือหนึ่ง
        </h3>
        <p className="text-gray-500 dark:text-gray-400">สินค้าใหม่แกะกล่อง</p>
      </button>
      <button
        onClick={() => onSelectCondition("มือสอง")}
        className="group flex flex-col items-center justify-center rounded-lg border bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:border-yellow-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-yellow-400"
      >
        <FaWrench className="text-5xl text-yellow-500 transition-transform group-hover:scale-110" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
          มือสอง
        </h3>
        <p className="text-gray-500 dark:text-gray-400">สินค้าผ่านการใช้งาน</p>
      </button>
    </div>
  );
}
