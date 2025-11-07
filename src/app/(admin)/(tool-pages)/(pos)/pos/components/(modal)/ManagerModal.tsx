"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface ManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentManager: string;
  managerRefId: string;
  onManagerRefIdChange: (value: string) => void;
  onConfirm: (refId: string) => void;
}

export default function ManagerModal({
  isOpen,
  onClose,
  currentManager,
  managerRefId,
  onManagerRefIdChange,
  onConfirm,
}: ManagerModalProps) {
  const handleConfirm = () => {
    if (managerRefId.trim()) {
      onConfirm(managerRefId.trim());
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-[500px] rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-6">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
            👤 เปลี่ยนผู้ขาย
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            กรอกรหัสอ้างอิงของผู้ขายเพื่อสลับการขาย
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ผู้ขายปัจจุบัน
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
            {currentManager}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label
            htmlFor="managerRefId"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            รหัสอ้างอิงผู้ขาย (Manager ID)
          </label>
          <input
            id="managerRefId"
            type="text"
            placeholder="เช่น: MGR001, nakka_v2, ..."
            value={managerRefId}
            onChange={(e) => onManagerRefIdChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        {managerRefId.trim() && (
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ผู้ขายใหม่
            </p>
            <p className="mt-1 text-lg font-bold text-green-700 dark:text-green-300">
              {managerRefId}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            onClick={handleConfirm}
            disabled={!managerRefId.trim()}
          >
            ✓ ยืนยันเปลี่ยนผู้ขาย
          </Button>
        </div>
      </div>
    </Modal>
  );
}
