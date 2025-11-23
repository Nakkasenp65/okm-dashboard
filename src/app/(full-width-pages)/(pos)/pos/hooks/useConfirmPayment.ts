import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const API_ROUTE = process.env.NEXT_PUBLIC_POS_API_ROUTE;

// --- Interfaces ---

export interface ConfirmPaymentPayload {
  sellerId: string;
  paymentDetails: {
    method: string;
    amount: number;
    refNo?: string;
    timestamp?: string;
  }[];
  customer?: {
    customerType: string;
    customerName: string;
    phoneNumber?: string;
    // Add other customer fields if needed
  };
  isTaxInvoice?: boolean;
  discountAmount?: number;
  vatMode?: string;
  note?: string;
}

export interface ConfirmPaymentResponse {
  message: string;
  status: string;
  transactionId: string;
  documentId: string;
  totalAmount: number;
  sold_products: unknown[];
}

// --- API Function ---

const confirmPayment = async (payload: ConfirmPaymentPayload): Promise<ConfirmPaymentResponse> => {
  if (!API_ROUTE) throw new Error("API route not defined");
  const { data } = await axios.post<ConfirmPaymentResponse>(`${API_ROUTE}/confirm-payment`, payload);
  return data;
};

// --- Hook ---

export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: confirmPayment,
  });
};
