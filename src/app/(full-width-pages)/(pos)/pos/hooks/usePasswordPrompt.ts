import { useState, useCallback } from "react";

interface PromptConfig {
  title: string;
  message: string;
}

// This will hold the resolve function of the promise
let resolveCallback: (value: string | null) => void;

export const usePasswordPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<PromptConfig>({
    title: "",
    message: "",
  });

  const prompt = useCallback(
    (newConfig: PromptConfig): Promise<string | null> => {
      setConfig(newConfig);
      setIsOpen(true);
      return new Promise<string | null>((resolve) => {
        resolveCallback = resolve;
      });
    },
    [],
  );

  const onConfirm = useCallback((password: string) => {
    if (resolveCallback) {
      resolveCallback(password);
    }
    setIsOpen(false);
  }, []);

  const onClose = useCallback(() => {
    if (resolveCallback) {
      resolveCallback(null); // Resolve with null if cancelled
    }
    setIsOpen(false);
  }, []);

  // Props to be spread onto the PasswordPromptModal component
  const promptProps = {
    isOpen,
    onConfirm,
    onClose,
    ...config,
  };

  return { prompt, promptProps };
};
