import { useEffect, useState } from "react";

export interface ProductPrice {
  stock_id: number;
  cost: string;
  repair: string;
  level_1: string;
  level_2: string;
  level_3: string;
  level_4: string;
}

export interface Product {
  id: number;
  name: string;
  prices: ProductPrice;
}

interface PosApiResponse {
  status: { is: boolean; code: number; message: string };
  data: {
    page: number;
    page_per: number;
    total: number;
    from: number;
    to: number;
    tbody: Product[];
  };
}

export interface UsePosMockDataResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Custom hook to fetch POS mock data JSON
export function usePosMockData(): UsePosMockDataResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Dynamic import keeps this working in both Next.js and test environments
    import("../mockData.json")
      .then((module) => {
        const json = module.default as PosApiResponse;
        const rows = json?.data?.tbody ?? [];
        if (isMounted) {
          setProducts(rows);
        }
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

  return { products, loading, error };
}

// Helper to extract a numeric unit price from a product
export function getUnitPrice(product: Product): number {
  const raw = product?.prices?.level_1 ?? "0";
  const parsed = parseFloat(String(raw));
  return Number.isFinite(parsed) ? parsed : 0;
}