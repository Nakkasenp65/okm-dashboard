import { useState, useCallback } from 'react';
import { PosHistoryItem, PosHistoryResponse, Pagination } from '../types/Pos';
import axios from 'axios';

interface UsePosHistoryReturn {
  history: PosHistoryItem[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  fetchHistory: (page: number, limit: number, employeeId: string) => Promise<void>;
  fetchHistoryById: (id: string) => Promise<PosHistoryItem | null>;
}

export const usePosHistory = (): UsePosHistoryReturn => {
  const [history, setHistory] = useState<PosHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_ROUTE = process.env.NEXT_PUBLIC_POS_API_ROUTE;

  const fetchHistory = useCallback(async (page: number, limit: number, employeeId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!API_ROUTE) throw new Error("API route not defined");
      // Use the provided API endpoint structure
      // Assuming the base URL is handled by axios config or proxy, but for now using relative path
      // If the user provided a full URL, we might need to use that base or configure it.
      // Given the user context "https://pos-okmobile.vercel.app/history...", we'll assume /api/history or similar internal route if possible,
      // but to be safe and follow the user's "use the real data" with that URL, I'll try to call the endpoint.
      // However, calling external URL directly might have CORS issues if not proxied.
      // I will assume there is a local proxy or I should use the relative path `/history` if it's a direct backend route.
      // Let's try relative path `/api/history` first as is common in Next.js, or just `/history` if it's a direct backend route.
      // The user gave: https://pos-okmobile.vercel.app/history?page=1&limit=1&employeeId=EMP001
      // This looks like a GET request to /history.
      
      const response = await axios.get<PosHistoryResponse>(`${API_ROUTE}/history`, {
        params: {
          page,
          limit,
          employeeId
        }
      });
      if (response.data && response.data.data) {
        setHistory(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setHistory([]);
        setPagination(null);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [API_ROUTE]);

  const fetchHistoryById = useCallback(async (id: string) => {
    // For now, we don't have a specific endpoint for single item by ID confirmed.
    return null;
  }, []);

  return {
    history,
    pagination,
    isLoading,
    error,
    fetchHistory,
    fetchHistoryById,
  };
};
