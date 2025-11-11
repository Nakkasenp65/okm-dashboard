import React from "react";

const SegmentedControlButton = ({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-indigo-600 text-white shadow"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
    }`}
  >
    {children}
  </button>
);

export default SegmentedControlButton;
