// hooks/useZipLocation.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface ZipLocationResult {
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

interface UseZipLocationOptions {
  limit?: number;
  signal?: AbortSignal;
}

export function useZipLocation(
  zipCode: string,
  options: UseZipLocationOptions = {},
) {
  const { limit = 100 } = options;

  const endpoint = process.env.NEXT_PUBLIC_SUPABASE_ADDRESS_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ADDRESS_ANON_KEY;

  const searchTerm = zipCode?.trim() ?? "";
  const enabled = Boolean(searchTerm.length > 0);

  return useQuery<ZipLocationResult[]>({
    queryKey: ["zipLocation", searchTerm, limit],
    queryFn: async () => {
      if (!searchTerm) return [];

      const body = {
        search: searchTerm,
        type: "zip",
        limit,
      };

      const config = {
        method: "POST",
        url: endpoint,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        data: JSON.stringify(body),
      };

      const { data } = await axios.request(config);

      if (!data) {
        throw new Error(`Location API error: ${data.status} ${data.message}`);
      }

      return data;
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
}

export default useZipLocation;
