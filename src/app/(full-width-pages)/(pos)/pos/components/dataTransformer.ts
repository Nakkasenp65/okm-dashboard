// app/admin/pos/components/dataTransformer.ts

// --- Types ---
export interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  brand: string; // ** เพิ่ม property นี้ **
  condition: "มือหนึ่ง" | "มือสอง"; // สมมติว่ามีข้อมูลนี้
  stock: number; // สมมติว่ามีข้อมูลนี้
  createdAt: Date;
}

// --- Helper Function to Extract Brand ---
// ฟังก์ชันนี้จะพยายามหาชื่อแบรนด์จากชื่อสินค้า
const KNOWN_BRANDS = [
  "Samsung",
  "Vivo",
  "Oppo",
  "Xiaomi",
  "Redmi",
  "Realme",
  "Honor",
  "Google",
  "Huawei",
  "Infinix",
  // Apple keywords are handled separately below
];

const APPLE_KEYWORDS = ["apple", "iphone", "ipad", "airpods"];

const extractBrandFromName = (name: string): string => {
  const lowerCaseName = name.toLowerCase();

  // 1. Check for Apple keywords first
  for (const keyword of APPLE_KEYWORDS) {
    if (lowerCaseName.includes(keyword)) {
      return "Apple";
    }
  }

  // 2. If not Apple, check for other known brands
  for (const brand of KNOWN_BRANDS) {
    if (lowerCaseName.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  // 3. If no brand is found, return "Others"
  return "Others";
};

// Type for API response item
interface ApiProductItem {
  id: number;
  name: string;
  barcode: string;
  prices?: {
    level_1?: string | number;
    cost?: string | number;
  };
  category?: {
    name?: string;
  };
  count_name_md5?: number;
  created_at: string;
}

// --- Main Transformer Function ---
export const transformApiDataToProducts = (
  apiData: ApiProductItem[],
): Product[] => {
  if (!Array.isArray(apiData)) {
    console.error("API data is not an array:", apiData);
    return [];
  }

  return apiData.map((item) => {
    const brand = extractBrandFromName(item.name);
    const isNew =
      item.category?.name?.includes("เครื่องมือ1") ||
      item.category?.name?.includes("เครื่องมือ 1");

    return {
      id: item.id,
      name: item.name,
      barcode: item.barcode,
      price: parseFloat(String(item.prices?.level_1 || 0)),
      cost: parseFloat(String(item.prices?.cost || 0)),
      brand: brand, // ** กำหนดค่า brand ที่นี่ **
      condition: isNew ? "มือหนึ่ง" : "มือสอง", // Logic การกำหนดสภาพสินค้า (ตัวอย่าง)
      stock: item.count_name_md5 || 1, // ใช้ count_name_md5 เป็นจำนวนสต็อก (ตัวอย่าง)
      createdAt: new Date(item.created_at),
    };
  });
};
