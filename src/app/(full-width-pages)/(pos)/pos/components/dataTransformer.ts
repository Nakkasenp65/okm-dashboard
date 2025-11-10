// Interface สำหรับข้อมูลดิบจาก API (เฉพาะ field ที่เราใช้)
interface RawApiProduct {
  id: number;
  name: string;
  barcode: string; // IMEI
  created_at: string; // วันที่สร้าง
  prices: {
    level_1: string;
  };
  category?: {
    name: string;
  };
}

// Interface สำหรับ Product ที่เราจะใช้ใน UI (จาก SelectedProductsTable)
export interface Product {
  id: number;
  brand: string;
  name: string;
  price: number;
  condition: "มือหนึ่ง" | "มือสอง";
  imageUrl: string;
  specs?: string;
  barcode: string; // IMEI
  createdAt: Date; // แปลงเป็น Date object เพื่อให้ sort ง่าย
}

// ฟังก์ชันสำหรับเดา "แบรนด์" จากชื่อสินค้า
function getBrandFromName(name: string): string {
  const lowerCaseName = name.toLowerCase();
  if (
    lowerCaseName.includes("iphone") ||
    lowerCaseName.includes("ipad") ||
    lowerCaseName.includes("apple")
  ) {
    return "Apple";
  }
  if (lowerCaseName.includes("samsung") || lowerCaseName.includes("galaxy")) {
    return "Samsung";
  }
  if (lowerCaseName.includes("google") || lowerCaseName.includes("pixel")) {
    return "Google";
  }
  if (lowerCaseName.includes("honor")) {
    return "Honor";
  }
  if (lowerCaseName.includes("huawei")) {
    return "Huawei";
  }
  // เพิ่มแบรนด์อื่นๆ ตามต้องการ
  return "อื่นๆ"; // แบรนด์เริ่มต้นถ้าไม่เจอ
}

// ฟังก์ชันสำหรับเดา "สภาพ" จากชื่อหมวดหมู่
function getConditionFromCategory(
  categoryName?: string,
): "มือหนึ่ง" | "มือสอง" {
  if (!categoryName) return "มือสอง"; // ถ้าไม่มีหมวดหมู่ ให้เป็นมือสองไว้ก่อน
  if (categoryName.includes("มือ1") || categoryName.includes("มือหนึ่ง")) {
    return "มือหนึ่ง";
  }
  if (categoryName.includes("มือ2") || categoryName.includes("มือสอง")) {
    return "มือสอง";
  }
  return "มือหนึ่ง"; // ถ้าไม่ระบุ ให้เป็นมือหนึ่ง
}

// **ฟังก์ชันหลัก: แปลงข้อมูลจาก API (tbody) ให้เป็น Product[]**
export function transformApiDataToProducts(
  apiProducts: RawApiProduct[],
): Product[] {
  return apiProducts
    .map((item) => {
      const price = parseFloat(item.prices?.level_1) || 0;

      // ถ้าสินค้าไม่มีราคาขาย (เป็น 0) ก็ไม่ต้องแสดงใน catalog
      if (price === 0) {
        return null;
      }

      const product: Product = {
        id: item.id,
        name: item.name.trim(),
        price: price,
        brand: getBrandFromName(item.name),
        condition: getConditionFromCategory(item.category?.name),
        imageUrl: "/images/assets/default-phone.svg", // ใช้รูปภาพ placeholder
        specs: item.category?.name || "",
        barcode: item.barcode, // เพิ่ม barcode (IMEI)
        createdAt: new Date(item.created_at), // แปลง string เป็น Date object
      };
      return product;
    })
    .filter((product): product is Product => product !== null); // กรองเอาค่า null ออก
}
