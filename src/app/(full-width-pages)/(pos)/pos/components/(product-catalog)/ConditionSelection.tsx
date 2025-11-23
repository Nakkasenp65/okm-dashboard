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
const conditionDetails: Record<
  Product["condition"],
  {
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    description: string;
    displayName: string;
    gradient: string;
    borderColor: string;
    iconColor: string;
    bgColor: string;
  }
> = {
  new: {
    Icon: FaHandSparkles,
    description: "สินค้าใหม่แกะกล่อง",
    displayName: "มือหนึ่ง",
    gradient: "from-green-500/10 to-emerald-500/10",
    borderColor: "border-green-500/20 hover:border-green-500",
    iconColor: "text-green-500",
    bgColor: "bg-gradient-to-br",
  },
  used: {
    Icon: FaWrench,
    description: "สินค้าผ่านการใช้งาน",
    displayName: "มือสอง",
    gradient: "from-amber-500/10 to-yellow-500/10",
    borderColor: "border-amber-500/20 hover:border-amber-500",
    iconColor: "text-amber-500",
    bgColor: "bg-gradient-to-br",
  },
};

// MARK: - Main Component
export default function ConditionSelection({ onSelectCondition, availableConditions }: ConditionSelectionProps) {
  const containerClasses = clsx(
    "h-full p-4 sm:p-6",
    {
      "flex items-center justify-center": availableConditions.length === 1,
      "grid grid-cols-1 place-content-center gap-4 sm:grid-cols-2": availableConditions.length > 1,
    },
  );

  return (
    <div className={containerClasses}>
      {availableConditions.map((condition) => {
        const details = conditionDetails[condition];
        if (!details) return null;

        const { Icon, description, displayName, gradient, borderColor, iconColor, bgColor } = details;

        return (
          <button
            key={condition}
            onClick={() => onSelectCondition(condition)}
            className={clsx(
              "group relative overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
              bgColor,
              gradient,
              borderColor,
              availableConditions.length === 1 && "w-full sm:max-w-md",
            )}
          >
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 transition-transform duration-500 group-hover:scale-150"></div>
            
            <div className="relative flex flex-col items-center gap-4">
              {/* Icon */}
              <div className="rounded-2xl bg-white/50 p-6 shadow-lg transition-all duration-300 group-hover:scale-110 dark:bg-gray-800/50">
                <Icon size={64} className={clsx("transition-transform duration-300", iconColor)} />
              </div>
              
              {/* Display Name */}
              <h3 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{displayName}</h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
