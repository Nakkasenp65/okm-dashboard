import React from "react";

const InputField = ({
  label,
  value,
  onChange,
  placeholder = "",
  isTextarea = false,
}: {
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  isTextarea?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
      {label}
    </label>
    {isTextarea ? (
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
      />
    )}
  </div>
);

export default InputField;
