import { useState, useCallback } from "react";
import { ConfirmationType } from "../components/(modal)/ConfirmationModal";

interface ConfirmationConfig {
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
}

export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmationConfig>({
    title: "",
    message: "",
  });

  const showConfirmation = useCallback((newConfig: ConfirmationConfig) => {
    setConfig(newConfig);
    setIsOpen(true);
  }, []);

  const hideConfirmation = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirm = useCallback((newConfig: ConfirmationConfig) => {
    return new Promise<boolean>((resolve) => {
      setConfig({
        ...newConfig,
        onConfirm: () => {
          if (newConfig.onConfirm) {
            newConfig.onConfirm();
          }
          resolve(true);
        },
      });
      setIsOpen(true);
    });
  }, []);

  return {
    isOpen,
    config,
    showConfirmation,
    hideConfirmation,
    confirm,
  };
};
