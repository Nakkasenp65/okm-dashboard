import React from 'react';
import { PosHistoryItem, Pagination } from '../../types/Pos';
import { FaEye, FaChevronLeft, FaChevronRight, FaInbox } from 'react-icons/fa';
import Button from '@/components/ui/button/Button';

interface PosHistoryListProps {
  history: PosHistoryItem[];
  pagination: Pagination | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onViewDetails: (item: PosHistoryItem) => void;
}

export default function PosHistoryList({
  history,
  pagination,
  isLoading,
  onPageChange,
  onViewDetails,
}: PosHistoryListProps) {
  if (isLoading && history.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && history.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <FaInbox className="text-3xl text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">ไม่พบประวัติการขาย</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ยังไม่มีรายการในช่วงเวลานี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Table Container */}
      <div className="flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-850">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  วันที่
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  เลขที่เอกสาร
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  ลูกค้า
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  ผู้ขาย
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  ยอดรวม
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  ดูรายละเอียด
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.map((item, index) => (
                <tr
                  key={item._id}
                  className={`transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-900/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(item.createdAt).toLocaleDateString('th-TH')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {item.documentId}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {item.customer.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.sellerId}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ฿{item.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(item)}
                      className="inline-flex items-center gap-2 rounded-lg border-indigo-200 bg-indigo-50 px-4 py-2 text-indigo-700 transition-all hover:bg-indigo-100 hover:shadow-md dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                    >
                      <FaEye size={14} />
                      <span className="hidden sm:inline">ดูรายละเอียด</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {pagination && (
        <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                แสดง {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                จากทั้งหมด <span className="font-semibold text-indigo-600 dark:text-indigo-400">{pagination.total}</span> รายการ
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => onPageChange(pagination.page - 1)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaChevronLeft size={12} />
                <span className="hidden sm:inline">ก่อนหน้า</span>
              </Button>
              <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 dark:from-indigo-900/30 dark:to-purple-900/30">
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  หน้า {pagination.page}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{pagination.totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="hidden sm:inline">ถัดไป</span>
                <FaChevronRight size={12} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
