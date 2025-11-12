import { useEffect, useState } from "react";
// 1. Import ตัวแปลงข้อมูล และ Type ของ Product ที่แปลงแล้ว
import {
  transformApiDataToProducts,
  Product as TransformedProduct,
} from "../components/dataTransformer";

// --- Interfaces สำหรับ Raw API Data (ข้อมูลดิบ) ---
interface User {
  id: number;
  fullname: string;
}

interface UserImport {
  stock_id: number;
  user_id: number;
  user: User;
}

interface Unit {
  id: number;
  name: string;
}

interface Category {
  id: number;
  color: string;
  name: string;
}

interface Prices {
  stock_id: number;
  cost: string;
  repair: string;
  level_1: string;
  level_2: string;
  level_3: string;
  level_4: string;
}

// Interface สำหรับข้อมูลดิบของ Product แต่ละชิ้นใน tbody
interface RawProduct {
  id: number;
  name: string;
  name_md5: string;
  barcode: string;
  barcode_md5: string;
  merchant_id: number;
  reminder_limit: number;
  category_id: number;
  unit_id: number | null;
  created_at: string;
  count_name_md5: number;
  prices: Prices;
  category: Category;
  unit: Unit | null;
  user_import: UserImport;
}

// Interface สำหรับโครงสร้าง JSON ทั้งหมดที่ได้รับมา
interface PosApiResponse {
  status: { is: boolean; code: number; message: string };
  data: {
    page: number;
    page_per: number;
    total: number;
    from: number;
    to: number;
    tbody: RawProduct[]; // ใช้ RawProduct สำหรับข้อมูลดิบ
    data: { [key: string]: RawProduct };
  };
}

// ✅ KEY CHANGE: ปรับปรุง Interface ของผลลัพธ์
export interface UsePosMockDataResult {
  products: TransformedProduct[];
  initialStock: Map<number, number>; // เปลี่ยนจาก availableStock เป็น initialStock
  loading: boolean;
  error: string | null;
}

// Custom hook to fetch and process POS mock data
export function usePosMockData(): UsePosMockDataResult {
  const [products, setProducts] = useState<TransformedProduct[]>([]);
  // ✅ KEY CHANGE: เปลี่ยน State เป็นตัวแปรธรรมดา
  const [initialStock, setInitialStock] = useState<Map<number, number>>(
    new Map(),
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    import("../mockData.json")
      .then((module) => {
        if (!isMounted) return;

        const json = module.default as PosApiResponse;
        const rawProducts = json?.data?.tbody ?? [];

        const transformedProducts = transformApiDataToProducts(rawProducts);
        const stockMap = new Map<number, number>();
        transformedProducts.forEach((product) => {
          stockMap.set(product.id, product.stock);
        });

        setProducts(transformedProducts);
        // ✅ KEY CHANGE: ตั้งค่า initialStock ที่นี่
        setInitialStock(stockMap);
      })
      .catch((e) => {
        if (isMounted) {
          setError(e instanceof Error ? e.message : "Failed to load data");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ KEY CHANGE: คืนค่า initialStock แทน
  return { products, initialStock, loading, error };
}

// Utility function ที่อาจจะยังจำเป็นอยู่ (เก็บไว้ในไฟล์เดียวกันได้)
export function getUnitPrice(product: RawProduct): number {
  const raw = product?.prices?.level_1 ?? "0";
  const parsed = parseFloat(String(raw));
  return Number.isFinite(parsed) ? parsed : 0;
}
