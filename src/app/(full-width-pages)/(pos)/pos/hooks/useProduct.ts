// MARK: - Imports
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "../types/Pos";

// MARK: - API Configuration
const API_ENDPOINT = process.env.NEXT_PUBLIC_STOCK_API_ROUTE;

// MARK: - Type Definitions for API Response

/** รูปแบบของข้อมูล Pagination ที่ได้จาก API */
interface ApiPagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

/** รูปแบบของ Response ทั้งหมดเมื่อดึงรายการสินค้า (หลายชิ้น) */
interface ProductsListApiResponse {
  success: boolean;
  pagination: ApiPagination;
  data: Product[];
}

/** รูปแบบของ Response ทั้งหมดเมื่อดึงสินค้าชิ้นเดียว */
interface SingleProductApiResponse {
  success: boolean;
  data: Product;
}

/** รูปแบบของ Response ทั้งหมดเมื่ออัปเดตสินค้าสำเร็จ */
interface UpdateProductApiResponse {
  success: boolean;
  message: string;
  data: Product;
}

// MARK: - Type Definition for Mutation Payload

/** รูปแบบของข้อมูลราคาที่สามารถส่งไปอัปเดตได้ (ทุก field เป็น optional) */
interface PartialApiPrices {
  cost?: string;
  repair?: string;
  level_1?: string;
  level_2?: string;
  level_3?: string;
  level_4?: string;
}

/**
 * รูปแบบของข้อมูล (Payload) ที่ส่งไปกับ PATCH request เพื่ออัปเดตสินค้า
 * ทุก field เป็น optional ตามที่ API กำหนด
 */
export interface UpdateProductPayload {
  name?: string;
  barcode?: string;
  reminder_limit?: number;
  details?: string;
  source?: string;
  prices?: PartialApiPrices;
  quantity?: number;
}

// MARK: - Hook 1: useProducts (For fetching a list of products)
interface UseProductsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const fetchProductsList = async (params: UseProductsParams): Promise<ProductsListApiResponse> => {
  const response = await axios.get(`${API_ENDPOINT}/`, { params });
  return response.data;
};

export const useProducts = ({
  page = 1,
  limit = 10,
  searchTerm = "",
  sortBy = "created_at",
  sortOrder = "desc",
}: UseProductsParams = {}) => {
  const queryParams = { page, limit, searchTerm, sortBy, sortOrder };

  return useQuery({
    queryKey: ["products", "list", queryParams],
    queryFn: () => fetchProductsList(queryParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    select: (apiData) => ({
      products: apiData.data,
      pagination: apiData.pagination,
    }),
  });
};

// MARK: - Hook 2: useProduct (For fetching a single product by ID)
interface UseProductParams {
  id: number | string | null | undefined;
}

const fetchProductById = async (id: number | string): Promise<SingleProductApiResponse> => {
  const response = await axios.get(`${API_ENDPOINT}/${id}`);
  return response.data;
};

export const useProduct = ({ id }: UseProductParams) => {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// MARK: - Hook 3: useUpdateProduct (Mutation for updating a product)

const updateProductById = async ({
  id,
  payload,
}: {
  id: number | string;
  payload: UpdateProductPayload;
}): Promise<UpdateProductApiResponse> => {
  const response = await axios.patch(`${API_ENDPOINT}/${id}`, payload);
  return response.data;
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductById,
    onSuccess: (data, variables) => {
      console.log("Product updated successfully:", data);

      // Invalidate queries to refetch data from the server
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: ["products", "detail", variables.id] });
    },
    onError: (error) => {
      console.error("Failed to update product:", error);
    },
  });
};
