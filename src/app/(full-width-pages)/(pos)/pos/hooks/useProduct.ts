// MARK: - Imports
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "../types/Pos";

// MARK: - API Configuration
const API_ENDPOINT = "https://stock-entry-service.vercel.app/api/products";

// MARK: - Type Definitions for API Response

/** รูปแบบของข้อมูล Pagination ที่ได้จาก API */
interface ApiPagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

/** รูปแบบของข้อมูล Product หนึ่งชิ้นที่ได้จาก API โดยตรง */
interface ApiProduct {
  _id: string;
  id: number;
  name: string;
  barcode: string;
  details: string;
  quantity: number;
  created_at: string;
  source?: string;
  imageApi?: string;
  image1?: string;
  brand: string;
  condition: "new" | "used";
  prices: {
    cost: string;
    level_1: string;
    [key: string]: string; // แก้จาก any
  };
  category: {
    id: string;
    color: string;
    name: string;
  };
  [key: string]: unknown; // แก้จาก any
}

/** รูปแบบของ Response ทั้งหมดเมื่อดึงรายการสินค้า (หลายชิ้น) */
interface ProductsListApiResponse {
  success: boolean;
  pagination: ApiPagination;
  data: ApiProduct[];
}

/** รูปแบบของ Response ทั้งหมดเมื่อดึงสินค้าชิ้นเดียว */
interface SingleProductApiResponse {
  success: boolean;
  data: ApiProduct;
}

/** รูปแบบของ Response ทั้งหมดเมื่ออัปเดตสินค้าสำเร็จ */
interface UpdateProductApiResponse {
  success: boolean;
  message: string;
  data: ApiProduct;
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

// MARK: - Data Transformation Helper (REVISED)
/**
 * ฟังก์ชันกลางสำหรับแปลงข้อมูลจาก ApiProduct ไปเป็น Product ที่แอปพลิเคชันต้องการ
 * เวอร์ชันนี้จะส่งผ่านข้อมูลส่วนใหญ่มาโดยตรง และเพิ่ม Logic การแปลงข้อมูลที่จำเป็นเท่านั้น
 */
const transformApiProduct = (apiProduct: ApiProduct): Product => {
  return {
    // --- Core Fields ---
    id: apiProduct.id,
    name: apiProduct.name,
    barcode: apiProduct.barcode,
    price: parseFloat(apiProduct.prices.level_1) || 0,
    cost: parseFloat(apiProduct.prices.cost) || 0,
    stock: apiProduct.quantity,
    createdAt: new Date(apiProduct.created_at),

    // --- Derived & Transformed Fields ---
    brand: apiProduct.brand || "ไม่ระบุ",
    condition: apiProduct.condition, // ใช้ค่าจาก API โดยตรง
    categoryColor: apiProduct.category.color,

    // --- Pass-through Fields from API ---
    _id: apiProduct._id,
    details: apiProduct.details,
    source: apiProduct.source,
    imageApi: apiProduct.imageApi,
    image1: apiProduct.image1,
    category: apiProduct.category,
  };
};

// MARK: - Hook 1: useProducts (For fetching a list of products)
interface UseProductsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const fetchProductsList = async (params: UseProductsParams): Promise<ProductsListApiResponse> => {
  const response = await axios.get(API_ENDPOINT, { params });
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
      products: apiData.data.map(transformApiProduct),
      pagination: apiData.pagination,
    }),
  });
};

// MARK: - Hook 2: useProduct (For fetching a single product by ID)
interface UseProductParams {
  id: number | string | null | undefined;
}

const fetchProductById = async (id: number | string): Promise<SingleProductApiResponse> => {
  const response = await axios.get(API_ENDPOINT, { params: { id } });
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
    select: (apiData) => transformApiProduct(apiData.data),
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
