// --- Types ---

import { Product } from "../types/Pos";

interface ApiProductItem {
  id: number;
  name: string;
  barcode: string;
  prices?: {
    level_1?: string | number;
    cost?: string | number;
  };
  category?: {
    id: number;
    color: string;
    name: string;
  };
  count_name_md5?: number;
  created_at: string;
}

// --- Logic to extract Brand and Condition from Category Name ---

interface ExtractedInfo {
  brand: string;
  condition: "มือหนึ่ง" | "มือสอง" | "อุปกรณ์เสริม";
}

const extractInfoFromCategory = (
  categoryName: string = "",
  productName: string = "",
): ExtractedInfo => {
  const lowerCategoryName = categoryName.toLowerCase();
  const lowerProductName = productName.toLowerCase();

  // Step 1: Determine the Condition
  let condition: "มือหนึ่ง" | "มือสอง" | "อุปกรณ์เสริม" = "อุปกรณ์เสริม";
  if (
    lowerCategoryName.includes("เครื่องมือ1") ||
    lowerCategoryName.includes("เครื่องมือ 1")
  ) {
    condition = "มือหนึ่ง";
  } else if (
    lowerCategoryName.includes("เครื่องมือ2") ||
    lowerCategoryName.includes("เครื่องมือ 2")
  ) {
    condition = "มือสอง";
  } else if (lowerCategoryName === "gadget" || lowerCategoryName === "ฟิล์ม") {
    condition = "อุปกรณ์เสริม";
  }

  // Step 2: Determine the Brand
  const categoryWords = categoryName.split(" ");
  const lastWord = categoryWords[categoryWords.length - 1].toLowerCase();

  const knownBrands = [
    "apple",
    "iphone",
    "ipad",
    "samsung",
    "vivo",
    "oppo",
    "xiaomi",
    "redmi",
    "realme",
    "honor",
    "google",
    "huawei",
    "infinix",
    "nokia",
    "oneplus",
    "beyond",
  ];

  for (const brand of knownBrands) {
    if (lastWord.includes(brand)) {
      const finalBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
      if (finalBrand === "Iphone" || finalBrand === "Ipad")
        return { brand: "Apple", condition };
      return { brand: finalBrand, condition };
    }
  }

  for (const brand of knownBrands) {
    if (lowerProductName.includes(brand)) {
      const finalBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
      if (finalBrand === "Iphone" || finalBrand === "Ipad")
        return { brand: "Apple", condition };
      return { brand: finalBrand, condition };
    }
  }

  return { brand: "อื่นๆ", condition };
};

// --- Main Transformer Function (Updated) ---
export const transformApiDataToProducts = (
  apiData: ApiProductItem[],
): Product[] => {
  if (!Array.isArray(apiData)) {
    console.error("API data is not an array:", apiData);
    return [];
  }

  return apiData.map((item) => {
    const { brand, condition } = extractInfoFromCategory(
      item.category?.name,
      item.name,
    );

    return {
      id: item.id,
      name: item.name,
      barcode: item.barcode,
      price: parseFloat(String(item.prices?.level_1 || 0)),
      cost: parseFloat(String(item.prices?.cost || 0)),
      brand: brand,
      condition: condition,
      stock: item.count_name_md5 || 1,
      createdAt: new Date(item.created_at),
      categoryColor: item.category?.color, // ส่วน Logic ตรงนี้ถูกต้องอยู่แล้ว
    };
  });
};
