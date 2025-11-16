import React from "react";
import clsx from "clsx"; // Import clsx เพื่อจัดการ class แบบมีเงื่อนไข

const InputField = ({
  label,
  value,
  onChange,
  placeholder = "",
  isTextarea = false,
  disabled = false, // ✅ KEY CHANGE: รับ disabled prop เข้ามา, ค่าเริ่มต้นคือ false
}: {
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  isTextarea?: boolean;
  disabled?: boolean; // ✅ KEY CHANGE: เพิ่ม type ของ disabled
}) => {
  // ✅ KEY CHANGE: สร้าง base classes และ disabled classes เพื่อนำไปใช้
  const baseClasses =
    "mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700";
  const disabledClasses =
    "bg-gray-100 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-400";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={3}
          disabled={disabled} // ✅ KEY CHANGE: ส่ง disabled prop ไปยัง textarea
          className={clsx(baseClasses, { [disabledClasses]: disabled })} // ✅ KEY CHANGE: เพิ่ม class เมื่อ disabled
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled} // ✅ KEY CHANGE: ส่ง disabled prop ไปยัง input
          className={clsx(baseClasses, { [disabledClasses]: disabled })} // ✅ KEY CHANGE: เพิ่ม class เมื่อ disabled
        />
      )}
    </div>
  );
};

export default InputField;
