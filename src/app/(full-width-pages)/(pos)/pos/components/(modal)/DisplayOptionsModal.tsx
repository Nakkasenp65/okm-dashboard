"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

// Interface สำหรับตัวเลือกการแสดงผล
export interface DisplayOptions {
  showImei: boolean;
  showPrice: boolean;
  showStock: boolean;
  displayMode: "grid" | "list";
}

// Props ที่ Modal นี้ต้องการ
interface DisplayOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOptions: DisplayOptions;
  onSave: (newOptions: DisplayOptions) => void;
}

// Helper Component สำหรับ Toggle Switch
const ToggleSwitch = ({
  label,
  isChecked,
  onChange,
}: {
  label: string;
  isChecked: boolean;
  onChange: () => void;
}) => (
  <label className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700">
    <span className="text-lg text-gray-700 dark:text-gray-300">{label}</span>
    <div className="relative">
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={onChange}
      />
      <div
        className={`block h-8 w-14 rounded-full transition ${isChecked ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
      ></div>
      <div
        className={`dot absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${isChecked ? "translate-x-6" : ""}`}
      ></div>
    </div>
  </label>
);

export default function DisplayOptionsModal({
  isOpen,
  onClose,
  initialOptions,
  onSave,
}: DisplayOptionsModalProps) {
  // State ภายใน Modal เพื่อจัดการการเปลี่ยนแปลงชั่วคราวก่อนกดบันทึก
  const [currentOptions, setCurrentOptions] =
    useState<DisplayOptions>(initialOptions);

  // เมื่อ Modal เปิด, ให้ซิงค์ State ภายในกับค่าล่าสุดจากข้างนอก
  useEffect(() => {
    if (isOpen) {
      setCurrentOptions(initialOptions);
    }
  }, [isOpen, initialOptions]);

  const handleToggle = (option: keyof DisplayOptions) => {
    setCurrentOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleSaveClick = () => {
    onSave(currentOptions);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="w-full max-w-lg rounded-2xl p-0 shadow-2xl"
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            ตัวเลือกการแสดงผลสินค้า
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            เลือกข้อมูลที่จะแสดงบนการ์ดสินค้าแต่ละใบ
          </p>
        </div>

        {/* Content: List of Toggles */}
        <div className="space-y-2 p-6">
          <ToggleSwitch
            label="แสดงราคา"
            isChecked={currentOptions.showPrice}
            onChange={() => handleToggle("showPrice")}
          />
          <ToggleSwitch
            label="แสดง IMEI/รหัสสินค้า"
            isChecked={currentOptions.showImei}
            onChange={() => handleToggle("showImei")}
          />
          <ToggleSwitch
            label="แสดงจำนวนคงเหลือ"
            isChecked={currentOptions.showStock}
            onChange={() => handleToggle("showStock")}
          />

          {/* Display Mode Selection */}
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
              วิธีการแสดงผล
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setCurrentOptions((prev) => ({
                    ...prev,
                    displayMode: "grid",
                  }))
                }
                className={`rounded-lg border-2 p-3 text-center font-medium transition ${
                  currentOptions.displayMode === "grid"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                📱 Grid
              </button>
              <button
                onClick={() =>
                  setCurrentOptions((prev) => ({
                    ...prev,
                    displayMode: "list",
                  }))
                }
                className={`rounded-lg border-2 p-3 text-center font-medium transition ${
                  currentOptions.displayMode === "list"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                📋 List
              </button>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="py-3 text-base font-medium"
          >
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveClick}
            className="py-3 text-base font-semibold shadow-lg"
          >
            บันทึก
          </Button>
        </div>
      </div>
    </Modal>
  );
}
