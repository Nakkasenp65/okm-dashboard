import React from "react";
import Image from "next/image";
import { FallbackLogo } from "./FallbackLogo";

interface BrandLogoProps {
  brand: string;
  color?: string;
  className?: string;
}

// สร้าง Map เพื่อจับคู่ "ชื่อแบรนด์" (ตัวพิมพ์เล็ก) กับ "ชื่อไฟล์โลโก้" ที่ถูกต้อง
const brandLogoMap: { [key: string]: string } = {
  apple: "AppleLogo.svg",
  google: "GoogleLogo.svg",
  huawei: "HuaweiLogo.svg",
  nokia: "NokiaLogo.svg",
  oneplus: "OneplusLogo.svg",
  oppo: "OppoLogo.svg",
  realme: "RealmeLogo.svg",
  redmi: "redmi.svg",
  samsung: "SamsungLogo.svg",
  vivo: "VivoLogo.svg",
  xiaomi: "XiaomiLogo.svg",
  infinix: "InfinixLogo.svg",
};

export const BrandLogo = ({
  brand,
  color,
  className = "h-6 w-6",
}: BrandLogoProps) => {
  const lowerCaseBrand = brand.toLowerCase();
  const logoFileName = brandLogoMap[lowerCaseBrand];

  // กรณีที่: เรามีไฟล์โลโก้สำหรับแบรนด์นี้
  if (logoFileName) {
    // ✅ ปรับปรุง Logic ตรงนี้:
    // กำหนดคลาส hover effect ไว้ล่วงหน้า
    // ถ้าไม่ใช่ 'infinix' ให้เพิ่มคลาส group-hover เข้าไป
    const hoverEffectClasses =
      lowerCaseBrand !== "infinix"
        ? "group-hover:brightness-0 group-hover:invert"
        : "";

    return (
      <div className={`relative ${className}`}>
        <Image
          src={`/images/assets/${logoFileName}`}
          alt={`${brand} Logo`}
          layout="fill"
          objectFit="contain"
          unoptimized={true}
          // นำคลาสทั้งหมดมารวมกัน ทำให้โค้ดไม่ซ้ำซ้อน
          className={`transition-all duration-100 ease-in-out ${hoverEffectClasses}`}
        />
      </div>
    );
  }

  // กรณีที่: ไม่มีไฟล์โลโก้ ให้ใช้ FallbackLogo
  return <FallbackLogo brandName={brand} color={color} className={className} />;
};
