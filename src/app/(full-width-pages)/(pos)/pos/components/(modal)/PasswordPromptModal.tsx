"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { FaKey } from "react-icons/fa";

interface PasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
  message: string;
}

const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input and clear state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword(""); // Clear previous password
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // Small delay to ensure modal is rendered
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(password);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="relative p-8">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-400/20 to-gray-600/20">
            <FaKey className="h-12 w-12 text-gray-500" />
          </div>
        </div>

        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>

        <p className="mb-6 text-center text-base leading-relaxed text-gray-600 dark:text-gray-300">
          {message}
        </p>

        <div className="mb-8">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 p-3 text-center text-lg tracking-widest shadow-inner focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="••••••••"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-200 py-3 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-semibold text-white hover:from-blue-600 hover:to-cyan-600"
          >
            ยืนยัน
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordPromptModal;
