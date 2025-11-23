"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaTimesCircle,
} from "react-icons/fa";

export type ConfirmationType = "warning" | "success" | "info" | "error";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string | React.ReactNode;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "ตรวจสอบแล้ว",
  cancelText = "ยกเลิก",
  showCancel = true,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIconAndColor = () => {
    switch (type) {
      case "warning":
        return {
          icon: <FaExclamationTriangle className="h-16 w-16" />,
          color: "text-yellow-500",
          bgGradient: "from-yellow-500/20 to-orange-500/20",
        };
      case "success":
        return {
          icon: <FaCheckCircle className="h-16 w-16" />,
          color: "text-green-500",
          bgGradient: "from-green-500/20 to-emerald-500/20",
        };
      case "error":
        return {
          icon: <FaTimesCircle className="h-16 w-16" />,
          color: "text-red-500",
          bgGradient: "from-red-500/20 to-rose-500/20",
        };
      case "info":
      default:
        return {
          icon: <FaInfoCircle className="h-16 w-16" />,
          color: "text-blue-500",
          bgGradient: "from-blue-500/20 to-cyan-500/20",
        };
    }
  };

  const { icon, color, bgGradient } = getIconAndColor();

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="relative p-8">
        {/* Icon Section */}
        <div className="mb-6 flex justify-center">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${bgGradient}`}
          >
            <div className={color}>{icon}</div>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>

        {/* Message */}
        <div className="mb-8 text-left text-base leading-relaxed text-gray-600 whitespace-pre-line dark:text-gray-300">
          {message}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {showCancel && (
            <Button
              onClick={onClose}
              className="flex-1 rounded-xl bg-gray-200 py-3 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            className={`flex-1 rounded-xl py-3 font-semibold text-white ${type === "warning"
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              : type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                : type === "error"
                  ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
