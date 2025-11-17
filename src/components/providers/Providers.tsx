"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../../context/ThemeContext";
import { SidebarProvider } from "../../context/SidebarContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// MARK: - POS Context for State Management

// 1. Define the shape of our context state
export type PosMode = "retail" | "company";

// 2. Create the context with a default undefined value

// MARK: - TanStack Query Client Configuration

// Create a client instance outside of the component to prevent re-creation on render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global default options for all queries
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Optional: disable refetching on window focus
    },
  },
});

// MARK: - Main AppProviders Component

/**
 * This is the main provider component that wraps all other providers.
 * It will be used in the root layout to provide context to the entire application.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    // 1. TanStack Query Provider
    <QueryClientProvider client={queryClient}>
      {/* 2. POS State Management Provider */}
      {/* 3. Theme Provider for Dark/Light Mode */}
      <ThemeProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
