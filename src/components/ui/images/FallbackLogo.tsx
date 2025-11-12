import React from "react";

interface FallbackLogoProps {
  brandName: string;
  color?: string; // สี hex code จาก API เช่น "#fc9d12"
  className?: string; // สำหรับการกำหนดขนาดจากภายนอก เช่น "h-6 w-6"
}

export const FallbackLogo = ({
  brandName,
  color,
  className = "h-6 w-6", // กำหนดขนาดเริ่มต้น
}: FallbackLogoProps) => {
  // หากไม่มีสีถูกส่งมา, ให้ใช้สีเทาเป็นค่าเริ่มต้น (default)
  // Tailwind CSS class: bg-gray-500
  const backgroundColor = color || "#6B7280";

  // ดึงตัวอักษรตัวแรกของชื่อแบรนด์มาแสดง
  // หาก brandName ไม่มีค่า, ให้แสดงเป็น "?"
  const firstLetter =
    brandName && brandName.length > 0 ? brandName[0].toUpperCase() : "?";

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ backgroundColor: backgroundColor }}
    >
      <span>{firstLetter}</span>
    </div>
  );
};
