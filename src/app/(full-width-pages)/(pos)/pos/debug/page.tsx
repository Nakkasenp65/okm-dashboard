"use client";

// MARK: - Imports
import React, { useState, Suspense, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaSpinner, FaBug, FaTrash, FaEdit, FaInfoCircle, FaTimes } from "react-icons/fa";
import { Product } from "../types/Pos";
import { UpdateProductPayload, useProduct, useProducts, useUpdateProduct } from "../hooks/useProduct";

// MARK: - Main Debug Component
function DebugPageContent() {
  const queryClient = useQueryClient();

  // MARK: State Management for List and Modals
  const [searchTerm, setSearchTerm] = useState("samsung");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [viewingProductId, setViewingProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "" });

  // MARK: Hook Invocations
  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    isFetching: isListFetching,
  } = useProducts({ page, limit, searchTerm });

  const {
    data: singleProductData,
    isLoading: isSingleLoading,
    error: singleProductError,
  } = useProduct({ id: viewingProductId });

  const updateMutation = useUpdateProduct();

  // MARK: Handlers
  const handleCloseModals = useCallback(() => {
    setViewingProductId(null);
    setEditingProduct(null);
  }, []);

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, price: Number(product.prices?.level_1 || 0).toFixed(2) });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const payload: UpdateProductPayload = {};
    if (editForm.name !== editingProduct.name) {
      payload.name = editForm.name;
    }
    if (editForm.price !== Number(editingProduct.prices?.level_1 || 0).toFixed(2)) {
      payload.prices = { level_1: editForm.price };
    }

    if (Object.keys(payload).length > 0) {
      updateMutation.mutate(
        { id: editingProduct.id, payload },
        {
          onSuccess: () => {
            // Close modals after successful update
            handleCloseModals();
          },
          onError: (error) => {
            console.error("Update failed:", error);
            // Optionally show error to user
          },
        },
      );
    } else {
      // No changes were made
      handleCloseModals();
    }
  };

  // Effect to handle Escape key for closing modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseModals();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCloseModals]);

  // MARK: - Render JSX
  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <FaBug className="text-2xl text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Product Hooks Test Page</h1>
            </div>
            <button
              onClick={() => queryClient.clear()}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <FaTrash />
              <span>Clear Cache</span>
            </button>
          </div>

          {/* Product List Section */}
          <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">`useProducts` Hook (Real API)</h2>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search for a product..."
              className="mt-2 w-full rounded-md border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-4 min-h-[300px]">
              {isListLoading ? (
                <div className="flex h-60 items-center justify-center gap-3 text-lg text-blue-500">
                  <FaSpinner className="animate-spin" />
                  <span>Initial Loading...</span>
                </div>
              ) : isListError ? (
                <div className="flex h-60 items-center justify-center text-red-500">
                  <p>Error: {listError.message}</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {listData?.products?.map((product) => (
                          <tr key={product.id}>
                            <td className="px-4 py-2">{product.id}</td>
                            <td className="px-4 py-2 font-medium">{product.name}</td>
                            <td className="px-4 py-2">฿{Number(product.prices?.level_1 || 0).toFixed(2)}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setViewingProductId(product.id)}
                                  className="text-blue-500 hover:text-blue-700"
                                  title="View Details"
                                >
                                  <FaInfoCircle />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(product)}
                                  className="text-yellow-500 hover:text-yellow-700"
                                  title="Edit Product"
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination Controls */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="rounded-md bg-gray-200 px-4 py-2 text-sm disabled:opacity-50 dark:bg-gray-700"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-3 text-sm">
                      Page {listData?.pagination?.currentPage} of {listData?.pagination?.totalPages}
                      {isListFetching && !isListLoading && <FaSpinner className="animate-spin text-blue-500" />}
                    </div>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!listData || page >= listData.pagination.totalPages}
                      className="rounded-md bg-gray-200 px-4 py-2 text-sm disabled:opacity-50 dark:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {viewingProductId && (
        <div
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={handleCloseModals}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-600">
              <h3 className="text-lg font-bold">Product Details (ID: {viewingProductId})</h3>
              <button
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mt-4 min-h-[200px]">
              {isSingleLoading ? (
                <FaSpinner className="mx-auto animate-spin text-2xl" />
              ) : singleProductError ? (
                <p className="text-red-500">{singleProductError.message}</p>
              ) : (
                <pre className="rounded bg-gray-100 p-4 text-xs whitespace-pre-wrap dark:bg-gray-700">
                  {JSON.stringify(singleProductData, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={handleCloseModals}
        >
          <form
            onSubmit={handleUpdateSubmit}
            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-600">
              <h3 className="text-lg font-bold">Edit Product (ID: {editingProduct.id})</h3>
              <button
                type="button"
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-md border p-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div>
                <label htmlFor="edit-price" className="block text-sm font-medium">
                  Price
                </label>
                <input
                  id="edit-price"
                  type="text"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="mt-1 w-full rounded-md border p-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModals}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium dark:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                {updateMutation.isPending ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

// MARK: - Main Export with Suspense Wrapper
export default function DebugPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      }
    >
      <DebugPageContent />
    </Suspense>
  );
}
