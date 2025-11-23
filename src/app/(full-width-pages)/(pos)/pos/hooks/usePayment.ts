import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_ROUTE = process.env.NEXT_PUBLIC_POS_API_ROUTE;

// MARK: - API Interfaces

/**
 * Payment method allowed by the API
 */
export type PaymentMethodType = "CASH" | "PROMPTPAY" | "CARD" | "TRANSFER" | "ONLINE";

/**
 * Structure for a single payment item in the request
 */
export interface PaymentRequestItem {
  method: string | PaymentMethodType;
  amount: number;
  transactionId?: string; // If present, indicates an update
}

/**
 * The Payload expected by POST /add-payment
 */
export interface AddPaymentPayload {
  employeeId: string;
  payments: PaymentRequestItem[];
}

// MARK: - Domain Interfaces (Response Data)

export interface PosPaymentTransaction {
  _id: string;
  method: PaymentMethodType;
  amount: number;
  tendered?: number;
  change?: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  timestamp: string;
}

export interface PosPaymentSession {
  _id: string;
  summary: {
    subtotal: number;
    discount: number;
    grandTotal: number;
    totalPaid: number;
    remaining: number;
  };
  transactions: PosPaymentTransaction[];
  updatedAt: string;
}

// MARK: - API Functions

/**
 * Fetches the current payment session.
 * Replaced the mock with actual Axios call to ensure sync with server state.
 */
const fetchPosPayment = async (employeeId?: string): Promise<PosPaymentSession | null> => {
  if (!API_ROUTE) throw new Error("API route not defined");
  
  // Assuming a standard GET endpoint exists to retrieve the current session
  // You may need to adjust the URL '/get-payment-session' to match your actual backend GET route
  const { data } = await axios.get<PosPaymentSession>(`${API_ROUTE}/get-payment`, {
    params: { employeeId }
  });
  
  return data;
};

/**
 * Adds one or more payments to the database.
 */
const addPayment = async (payload: AddPaymentPayload): Promise<PosPaymentSession> => {
  if (!API_ROUTE) throw new Error("API route not defined");

  // Calls the specific route requested
  const { data } = await axios.post<PosPaymentSession>(`${API_ROUTE}/add-payment`, payload);
  return data;
};

// MARK: - Hook

export const usePayment = (employeeId?: string) => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["pos", "payment", employeeId];

  // 1. Query: Get Current Session Status
  const paymentQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchPosPayment(employeeId),
    staleTime: 0, // Always fetch fresh data when mounting or invalidating
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // 2. Mutation: Add Payment
  const addPaymentMutation = useMutation({
    mutationFn: addPayment,
    onSuccess: (updatedSession) => {
      // Option A: Update cache immediately with response data
      queryClient.setQueryData(QUERY_KEY, updatedSession);

      // Option B: Invalidate to trigger a refetch (Safety net)
      queryClient.invalidateQueries({ queryKey: ["pos", "payment"] });
    },
    onError: (error: unknown) => {
      console.error("Failed to add payment:", error);
      // You might want to handle error toasts here or in the UI component
    },
  });

  return {
    // Data
    paymentSession: paymentQuery.data || null,
    
    // Query States
    isLoadingSession: paymentQuery.isLoading,
    isSessionError: paymentQuery.isError,
    refetchSession: paymentQuery.refetch,

    // Mutation
    addPayment: addPaymentMutation.mutate,
    addPaymentAsync: addPaymentMutation.mutateAsync,
    
    // Mutation States
    isAddingPayment: addPaymentMutation.isPending,
    addPaymentError: addPaymentMutation.error,
  };
};