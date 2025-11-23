// --- Types ---

import { Product } from "../types/Pos";

interface ApiProductItem {
  id: number;
  _id?: string; // MongoDB ObjectId - ทำเป็น optional เพื่อรองรับข้อมูลจาก mock data
  name: string;
  barcode: string;
  details?: string;
  source?: string;
  imageApi?: string;
  image1?: string;
  prices?: {
    level_1?: string | number;
    cost?: string | number;
  };
  category?: {
    id: number | string;
    color: string;
    name: string;
  };
  count_name_md5?: number;
  created_at: string;
}

// --- Logic to extract Brand and Condition from Category Name ---

interface ExtractedInfo {
  brand: string;
  condition: Product["condition"]; // ใช้ type จาก Product โดยตรง
}

const extractInfoFromCategory = (categoryName: string = "", productName: string = ""): ExtractedInfo => {
  const lowerCategoryName = categoryName.toLowerCase();
  const lowerProductName = productName.toLowerCase();

  // Step 1: Determine the Condition (ใช้ "new" | "used" ตามที่ backend กำหนด)
  let condition: Product["condition"] = "used"; // default เป็น used
  if (lowerCategoryName.includes("เครื่องมือ1") || lowerCategoryName.includes("เครื่องมือ 1")) {
    condition = "new";
  } else if (lowerCategoryName.includes("เครื่องมือ2") || lowerCategoryName.includes("เครื่องมือ 2")) {
    condition = "used";
  }
  // ⚠️ ตัด logic "อุปกรณ์เสริม" ออก เพราะ backend รองรับเฉพาะ "new" | "used"

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
      if (finalBrand === "Iphone" || finalBrand === "Ipad") return { brand: "Apple", condition };
      return { brand: finalBrand, condition };
    }
  }

  for (const brand of knownBrands) {
    if (lowerProductName.includes(brand)) {
      const finalBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
      if (finalBrand === "Iphone" || finalBrand === "Ipad") return { brand: "Apple", condition };
      return { brand: finalBrand, condition };
    }
  }

  return { brand: "อื่นๆ", condition };
};

// --- Main Transformer Function (Updated) ---
export const transformApiDataToProducts = (apiData: ApiProductItem[]): Product[] => {
  if (!Array.isArray(apiData)) {
    console.error("API data is not an array:", apiData);
    return [];
  }

  return apiData.map((item) => {
    const { brand, condition } = extractInfoFromCategory(item.category?.name, item.name);

    return {
      // Original fields
      id: item.id,
      name: item.name,
      barcode: item.barcode,
      prices: {
        stock_id: item.id,
        cost: String(item.prices?.cost || "0"),
        repair: "0", // Default
        level_1: String(item.prices?.level_1 || "0"),
        level_2: "0", // Default
        level_3: "0", // Default
        level_4: "0", // Default
      },
      brand: brand,
      condition: condition,
      quantity: item.count_name_md5 || 1,
      availablequantity: item.count_name_md5 || 1,
      created_at: item.created_at,
      categoryColor: item.category?.color,

      // NEW fields from API
      _id: item._id || String(item.id), // fallback ถ้าไม่มี _id
      details: item.details || "",
      source: item.source,
      imageApi: item.imageApi,
      image1: item.image1,
      category: {
        id: String(item.category?.id || ""),
        color: item.category?.color || "",
        name: item.category?.name || "",
      },
    };
  });
};
