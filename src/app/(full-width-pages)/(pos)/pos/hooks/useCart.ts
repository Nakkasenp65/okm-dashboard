import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "../types/Pos";

// MARK: - Interfaces
export interface CartItemData extends Product {
    productId: string;
    stockPrice: number;
    soldPrice: number;
    discountAmount: number;
    stock: number;
    createdAt: Date;
}

export interface CartItem {
    _id: string;
    unique_id: string;
    createdAt: string;
    expiredAt: string;
    status: "holding" | "pending";
    data: CartItemData;
}

export interface GetCartResponse {
    message: string;
    count: number;
    items: CartItem[];
}

export interface AddToCartResponse {
    message: string;
    cartItem: CartItem;
    remaining_stock: number;
}

export interface RemoveFromCartResponse {
    message: string;
    removedItem: {
        unique_id: string;
        barcode: string;
        name: string;
    };
}

// MARK: - API Functions
const API_ROUTE = process.env.NEXT_PUBLIC_POS_API_ROUTE;

const addToCart = async ({ productId, employeeId }: { productId: string; employeeId?: string }): Promise<AddToCartResponse> => {
    if (!API_ROUTE) throw new Error("API route not defined");
    const { data } = await axios.post<AddToCartResponse>(`${API_ROUTE}/add_to_cart/${productId}`, {
        employeeId
    });
    return data;
};

const addToCartByBarcode = async ({ barcode, employeeId }: { barcode: string; employeeId?: string }): Promise<AddToCartResponse> => {
    if (!API_ROUTE) throw new Error("API route not defined");
    const { data } = await axios.post<AddToCartResponse>(`${API_ROUTE}/add-to-cart-barcode`, {
        barcode,
        employeeId
    });
    return data;
};

const removeFromCart = async (uniqueId: string): Promise<RemoveFromCartResponse> => {
    if (!API_ROUTE) throw new Error("API route not defined");
    const { data } = await axios.delete<RemoveFromCartResponse>(`${API_ROUTE}/remove-from-cart/${uniqueId}`);
    return data;
};

const updateCartItem = async ({ uniqueId, price, employeeId }: { uniqueId: string; price: number; employeeId?: string }): Promise<unknown> => {
    if (!API_ROUTE) throw new Error("API route not defined");
    const { data } = await axios.patch(`${API_ROUTE}/update-cart-item/${uniqueId}`, {
        price,
        employeeId
    });
    return data;
};

const getCart = async (employeeId?: string): Promise<GetCartResponse> => {
    if (!API_ROUTE) throw new Error("API route not defined");
    const url = employeeId
        ? `${API_ROUTE}/get-cart?employeeId=${employeeId}`
        : `${API_ROUTE}/get-cart`;

    const { data } = await axios.get<GetCartResponse>(url);
    return data;
};

const checkout = async (employeeId?: string): Promise<{ message: string }> => {
    if (!API_ROUTE) throw new Error("API route not defined");
    const { data } = await axios.post<{ message: string }>(`${API_ROUTE}/checkout`, {
        employeeId
    });
    return data;
};

// MARK: - NEW Cancel Checkout Function
const cancelCheckout = async (employeeId?: string): Promise<{ message: string }> => {
    if (!API_ROUTE) throw new Error("API route not defined");
    const { data } = await axios.post<{ message: string }>(`${API_ROUTE}/cancel-checkout`, {
        employeeId
    });
    return data;
};

// MARK: - Hook
export const useCart = (employeeId?: string) => {
    const queryClient = useQueryClient();

    const { data: cartData, isLoading, error, refetch, isError } = useQuery({
        queryKey: ["pos", "cart-api", employeeId],
        queryFn: () => getCart(employeeId),
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

    const addToCartMutation = useMutation({
        mutationFn: addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pos", "cart-api"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["pos", "payment"] });
        },
    });

    const addToCartByBarcodeMutation = useMutation({
        mutationFn: addToCartByBarcode,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pos", "cart-api"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["pos", "payment"] });
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: removeFromCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pos", "cart-api"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });

    const updateCartItemMutation = useMutation({
        mutationFn: updateCartItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pos", "cart-api"] });
        },
    });

    const checkoutMutation = useMutation({
        mutationFn: checkout,
    });

    // MARK: - NEW Cancel Mutation
    const cancelCheckoutMutation = useMutation({
        mutationFn: cancelCheckout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pos", "cart-api"] });
            queryClient.invalidateQueries({ queryKey: ["pos", "payment"] });
            
            // Optimistically clear the payment session cache to prevent auto-reopen race condition
            if (employeeId) {
                queryClient.setQueryData(["pos", "payment", employeeId], null);
            }
        },
    });

    return {
        cartData: cartData,
        cartItems: cartData?.items || [],
        isLoading: isLoading,
        isError: isError,
        error: error,
        refetchCart: refetch,
        
        // Add
        addToCart: addToCartMutation.mutate,
        addToCartAsync: addToCartMutation.mutateAsync,
        isAdding: addToCartMutation.isPending,
        addingProductId: addToCartMutation.variables?.productId,
        addError: addToCartMutation.error,
        
        // Remove
        removeFromCart: removeFromCartMutation.mutate,
        isRemoving: removeFromCartMutation.isPending,
        
        // Renew
        renewCartItem: async (uniqueId: string, productId: string) => {
            try {
                await removeFromCartMutation.mutateAsync(uniqueId);
                await addToCartMutation.mutateAsync({ productId, employeeId });
            } catch (error) {
                console.error("Failed to renew item:", error);
                throw error;
            }
        },
        isRenewing: removeFromCartMutation.isPending || addToCartMutation.isPending,
        
        // Update
        updateCartItem: updateCartItemMutation.mutate,
        isUpdating: updateCartItemMutation.isPending,
        
        // Barcode
        addToCartByBarcode: addToCartByBarcodeMutation.mutate,
        addToCartByBarcodeAsync: addToCartByBarcodeMutation.mutateAsync,
        isAddingByBarcode: addToCartByBarcodeMutation.isPending,
        addByBarcodeError: addToCartByBarcodeMutation.error,
        
        // Checkout
        checkout: checkoutMutation.mutateAsync,
        isCheckingOut: checkoutMutation.isPending,

        // MARK: - Cancel Checkout Export
        cancelCheckout: cancelCheckoutMutation.mutateAsync,
        isCancelingCheckout: cancelCheckoutMutation.isPending,
    };
};