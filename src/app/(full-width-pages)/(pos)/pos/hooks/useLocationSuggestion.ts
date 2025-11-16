// src/hooks/useLocationSuggestion.ts
"use client";

import { useQuery } from "@tanstack/react-query";

// [ลบ] เราไม่จำเป็นต้อง import supabase client ของ Project A มาที่นี่แล้ว
// import { supabase } from "@/lib/supabase";

// --- Types (เหมือนเดิม) ---
type SuggestionType = "province" | "amphoe" | "tambon" | "zip";

interface Options {
  type?: SuggestionType;
  provinceId?: number; // province ID filter
  amphoeId?: number; // amphoe ID filter
  tambonId?: number; // tambon ID filter
  limit?: number;
}

export interface LocationResult {
  zip_code?: string;
  tambon_name_th?: string;
  tambon_name_en?: string;
  amphoe_name_th?: string;
  amphoe_name_en?: string;
  province_name_th?: string;
  province_name_en?: string;
  tambon_id?: number;
  amphoe_id?: number;
  province_id?: number;
}
// --- จบส่วน Types ---

/**
 * useLocationSuggestion
 * [แก้ไข] เปลี่ยนจากการ query ตรง (หรือ invoke)
 * เป็นการใช้ `fetch` กับ URL และ ANON_KEY ของ Project B โดยตรง
 */
export function useLocationSuggestion(search: string, options: Options = {}) {
  const {
    type = "tambon",
    provinceId,
    amphoeId,
    tambonId,
    limit = 100,
  } = options;
  const enabled = true;

  // ดึง URL และ Key จาก environment variables
  const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_ADDRESS_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ADDRESS_ANON_KEY;

  return useQuery<LocationResult[], Error>({
    queryKey: [
      "locationSuggestion",
      type,
      search,
      provinceId,
      amphoeId,
      tambonId,
      limit,
    ],

    queryFn: async () => {
      // ตรวจสอบว่ามี Env ครบ
      if (!functionUrl || !anonKey) {
        console.error("Missing Address Query ENV variables");
        throw new Error("Missing Address Query ENV variables");
      }

      const searchTerm = search.trim();

      // นี่คือ JSON body ที่เราจะส่งไปให้ Edge Function
      const requestBody = {
        search: searchTerm,
        type: type,
        provinceId: provinceId,
        amphoeId: amphoeId,
        tambonId: tambonId,
        limit: limit,
      };

      try {
        // [เปลี่ยน] ใช้ `fetch` มาตรฐาน
        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          // ถ้า response ไม่ใช่ 2xx (เช่น 400, 401, 500)
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        // ถ้าสำเร็จ, return ข้อมูล JSON
        const data: LocationResult[] = await response.json();
        return data ?? [];
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("useLocationSuggestion (Fetch) error:", errorMessage);
        // โยน error ให้ react-query จัดการ (query.isError)
        throw new Error(errorMessage);
      }
    },
    enabled,
    staleTime: 120 * 60 * 1000, // 120 นาที
  });
}

export default useLocationSuggestion;
