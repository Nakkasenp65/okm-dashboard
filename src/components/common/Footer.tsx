"use client";
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer
      role="contentinfo"
      aria-label="Footer"
      className="w-full border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-6 md:px-6">
        <p className="text-center text-theme-sm text-gray-500 dark:text-gray-400">
          © 2025 NO1 Money+
        </p>
      </div>
    </footer>
  );
};

export default Footer;