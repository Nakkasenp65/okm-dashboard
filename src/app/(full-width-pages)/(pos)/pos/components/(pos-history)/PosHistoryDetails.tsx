import React from 'react';
import { PosHistoryItem } from '../../types/Pos';
import Button from '@/components/ui/button/Button';
import { FaArrowLeft, FaPrint, FaEdit, FaTrash } from 'react-icons/fa';

interface PosHistoryDetailsProps {
  item: PosHistoryItem;
  onBack: () => void;
  onPrint: () => void;
  onEdit: (item: PosHistoryItem) => void;
  onDelete: (item: PosHistoryItem) => void;
}

export default function PosHistoryDetails({ item, onBack, onPrint, onEdit, onDelete }: PosHistoryDetailsProps) {
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return <span className="text-gray-400 italic">N/A</span>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <FaArrowLeft />
          </Button>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {item.documentId}
          </h3>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="text-amber-600 hover:text-amber-700">
            <FaEdit className="mr-2" />
            แก้ไข
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(item)} className="text-red-600 hover:text-red-700">
            <FaTrash className="mr-2" />
            ลบ
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <FaPrint className="mr-2" />
            พิมพ์ใบเสร็จ
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* Customer Info */}
        <div className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">ข้อมูลลูกค้า (Customer)</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs text-gray-500">Customer Name</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.customer.customerName)}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Customer Type</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.customer.customerType)}</span>
            </div>
             <div>
              <span className="block text-xs text-gray-500">Member</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.customer.isMember)}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Phone</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.customer.customerPhone)}</span>
            </div>
             <div className="col-span-2">
              <span className="block text-xs text-gray-500">Address</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.customer.customerAddress)}</span>
            </div>
             <div>
              <span className="block text-xs text-gray-500">Customer ID</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.customer.customerId)}</span>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">รายการสินค้า (Products)</h4>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">สินค้า</th>
                  <th className="px-4 py-3 text-right">ราคาต้นทุน</th>
                  <th className="px-4 py-3 text-right">ราคาขาย</th>
                  <th className="px-4 py-3 text-right">ส่วนลด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {item.product.map((prod, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      <div>{prod.name}</div>
                      <div className="text-xs text-gray-500">{prod.barcode}</div>
                      {prod.details && <div className="text-xs text-gray-400">{prod.details}</div>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      ฿{prod.stockPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      ฿{prod.soldPrice.toLocaleString()}
                    </td>
                     <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      ฿{prod.discountAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Details */}
         <div className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">การชำระเงิน (Payment Details)</h4>
          <div className="space-y-2">
            {item.paymentDetails.map((pay, idx) => (
               <div key={idx} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{pay.method}</span>
                    <div className="text-xs text-gray-500">{new Date(pay.timestamp).toLocaleString('th-TH')}</div>
                     {pay.refNo && <div className="text-xs text-gray-500">Ref: {pay.refNo}</div>}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">฿{pay.amount.toLocaleString()}</span>
               </div>
            ))}
          </div>
        </div>

        {/* Transaction Details (All Fields) */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">รายละเอียดเพิ่มเติม (Transaction Info)</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
             <div>
              <span className="block text-xs text-gray-500">Document ID</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.documentId)}</span>
            </div>
             <div>
              <span className="block text-xs text-gray-500">Created At</span>
              <span className="font-medium text-gray-900 dark:text-white">{new Date(item.createdAt).toLocaleString('th-TH')}</span>
            </div>
             <div>
              <span className="block text-xs text-gray-500">Seller ID</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.sellerId)}</span>
            </div>
            
             <div>
              <span className="block text-xs text-gray-500">Total Amount</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">฿{item.totalAmount.toLocaleString()}</span>
            </div>
             <div>
              <span className="block text-xs text-gray-500">Discount Amount</span>
              <span className="font-medium text-gray-900 dark:text-white">฿{item.discountAmount.toLocaleString()}</span>
            </div>
             <div>
              <span className="block text-xs text-gray-500">Discount ID</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.discountId)}</span>
            </div>

             <div>
              <span className="block text-xs text-gray-500">VAT Mode</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.vatMode)}</span>
            </div>
             <div>
              <span className="block text-xs text-gray-500">Tax Invoice</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.isTaxInvoice)}</span>
            </div>
             <div>
              <span className="block text-xs text-gray-500">Tax Doc ID</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.taxDocumentId)}</span>
            </div>

             <div>
              <span className="block text-xs text-gray-500">Received Points</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.receivedPoint)}</span>
            </div>
             <div>
              <span className="block text-xs text-gray-500">Current Points</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.currentPoint)}</span>
            </div>
             <div className="col-span-2 md:col-span-3">
              <span className="block text-xs text-gray-500">Note</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatValue(item.note)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
