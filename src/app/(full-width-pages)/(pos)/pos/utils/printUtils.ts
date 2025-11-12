/**
 * Print utilities for POS receipts
 * Handles printing to PDF and physical printers
 */

export interface PrintOptions {
  pageSize?: "80mm" | "58mm" | "A5";
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Print HTML content to PDF or physical printer
 * @param elementRef - Reference to the HTML element to print
 * @param filename - Name for the PDF file
 * @param options - Print configuration options
 */
export const printReceiptToPDF = async (
  elementRef: HTMLDivElement | null,
  filename: string = "receipt.pdf",
  options: PrintOptions = {},
): Promise<void> => {
  if (!elementRef) {
    throw new Error("No element reference provided for printing");
  }

  const printContent = elementRef.innerHTML;
  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    throw new Error("Failed to open print window. Please allow popups.");
  }

  const pageSizeConfig = getPageSizeConfig(options.pageSize || "80mm");

  // ✅ HTML และ CSS สำหรับพิมพ์ใบเสร็จ thermal printer
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${filename}</title>
        <style>
          /* === Reset และ Base Styles === */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          /* --- Styles สำหรับหน้าจอ Preview --- */
          body {
            margin: 0;
            padding: 20px;
            background-color: #525659; /* พื้นหลังสีเทาสำหรับ preview */
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
          }

          #receipt-wrapper {
            /* ล็อกความกว้างตามขนาดกระดาษที่เลือก */
            width: ${pageSizeConfig.width};
            max-width: ${pageSizeConfig.width};
            min-width: ${pageSizeConfig.width};
            
            background-color: #ffffff;
            padding: ${pageSizeConfig.padding};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            
            /* ฟอนต์ที่รองรับภาษาไทย */
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Thonburi', 'Leelawadee UI', 'Noto Sans Thai', Arial, sans-serif;
            font-size: ${pageSizeConfig.fontSize};
            line-height: ${pageSizeConfig.lineHeight};
            color: #000;
            
            /* ป้องกันการ break ของเนื้อหา */
            page-break-inside: avoid;
          }

          /* === CRITICAL: @page และ @media print สำหรับการพิมพ์จริง === */
          @page {
            /* กำหนดขนาดกระดาษสำหรับ thermal printer */
            size: ${pageSizeConfig.width} ${pageSizeConfig.height};
            
            /* margin สำหรับ thermal printer (โดยปกติ thermal printer มี margin น้อยมาก) */
            margin: ${options.margins?.top || 0}mm ${options.margins?.right || 0}mm ${options.margins?.bottom || 0}mm ${options.margins?.left || 0}mm;
          }

          @media print {
            /* ลบพื้นหลังและ padding ออกเมื่อพิมพ์จริง */
            body {
              background-color: #ffffff !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            #receipt-wrapper {
              /* ล็อกความกว้างให้ตรงตามกระดาษเสมอ */
              width: ${pageSizeConfig.width} !important;
              max-width: ${pageSizeConfig.width} !important;
              min-width: ${pageSizeConfig.width} !important;
              
              /* ลบ shadow และปรับ padding */
              box-shadow: none !important;
              padding: ${pageSizeConfig.padding} !important;
              margin: 0 !important;
              
              /* บังคับให้เนื้อหาอยู่ในหน้าเดียว (สำหรับ A5) */
              page-break-inside: avoid;
            }

            /* ทำให้แน่ใจว่าตัวอักษรทั้งหมดเป็นสีดำเมื่อพิมพ์ */
            * {
              color: #000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* ซ่อนสิ่งที่ไม่ต้องการพิมพ์ */
            .no-print {
              display: none !important;
            }
          }

          /* --- Utility classes copied from the component to ensure consistency --- */
          /* Layout helpers */
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .flex-row { flex-direction: row; }
          .items-center { align-items: center; }
          .items-start { align-items: flex-start; }
          .items-end { align-items: flex-end; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .gap-1 { gap: 0.25rem; } .gap-2 { gap: 0.5rem; } .gap-3 { gap: 0.75rem; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .font-bold { font-weight: 700; }
          .font-medium { font-weight: 500; }
          .text-xs { font-size: 10px; line-height: 1.2; }
          .text-sm { font-size: 12px; line-height: 1.3; }
          .text-base { font-size: 14px; line-height: 1.4; }
          .leading-tight { line-height: 1.2; }
          .uppercase { text-transform: uppercase; }
          .whitespace-pre-wrap { white-space: pre-wrap; }
          .break-words { overflow-wrap: break-word; word-break: break-word; }
          .w-full { width: 100%; }
          .w-1\/2 { width: 50%; } .w-1\/3 { width: 33.333%; } .w-2\/3 { width: 66.666%; }
          .pr-1 { padding-right: 0.25rem; }
          .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; } .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .p-2 { padding: 0.5rem; } .p-3 { padding: 0.75rem; } .p-4 { padding: 1rem; }
          .mt-1 { margin-top: 0.25rem; } .mt-2 { margin-top: 0.5rem; } .mt-4 { margin-top: 1rem; }
          .mb-1 { margin-bottom: 0.25rem; } .mb-2 { margin-bottom: 0.5rem; } .mb-4 { margin-bottom: 1rem; }
          .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; } .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }

          /* Grid helpers commonly used in the receipt components */
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .col-span-2 { grid-column: span 2 / span 2; }
          .col-span-3 { grid-column: span 3 / span 3; }

          /* Borders */
          .border { border: 1px solid #000; }
          .border-t { border-top: 1px solid #000; }
          .border-b { border-bottom: 1px solid #000; }
          .border-l { border-left: 1px solid #000; }
          .border-r { border-right: 1px solid #000; }
          .border-dashed { border-style: dashed; }

          /* Tables */
          table { border-collapse: collapse; width: 100%; table-layout: fixed; }
          th, td { padding: 0.125rem 0; vertical-align: top; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <div id="receipt-wrapper">
          ${printContent}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 500);
    }, 250);
  };
};

const getPageSizeConfig = (pageSize: "80mm" | "58mm" | "A5") => {
  switch (pageSize) {
    case "58mm":
      // 58mm thermal paper standard
      return {
        width: "58mm", // ล็อกความกว้างที่ 58mm สำหรับ thermal printer
        height: "auto", // ความยาวตามเนื้อหา (thermal paper เป็นม้วน)
        fontSize: "9px", // ขนาดตัวอักษรที่เหมาะสมกับกระดาษ 58mm
        lineHeight: "1.3",
        padding: "2mm", // padding น้อยลงเพื่อใช้พื้นที่ให้คุ้มค่า
      };
    case "80mm":
      // 80mm thermal paper standard (ขนาดยอดนิยมสำหรับใบเสร็จ)
      return {
        width: "80mm", // ล็อกความกว้างที่ 80mm
        height: "auto",
        fontSize: "11px",
        lineHeight: "1.4",
        padding: "3mm",
      };
    case "A5":
      // A5 paper size (148mm x 210mm) สำหรับใบกำกับภาษีแบบฟอร์ม
      return {
        width: "148mm", // ล็อกความกว้างที่ 148mm (A5 width)
        height: "210mm", // ความสูง A5 standard
        fontSize: "11px",
        lineHeight: "1.5",
        padding: "8mm",
      };
    default:
      return {
        width: "80mm",
        height: "auto",
        fontSize: "11px",
        lineHeight: "1.4",
        padding: "3mm",
      };
  }
};

export const printToDevice = async (
  elementRef: HTMLDivElement | null,
): Promise<void> => {
  if (!elementRef) {
    throw new Error("No element reference provided for printing");
  }
  await printReceiptToPDF(elementRef, "receipt-print");
};

export const saveReceiptAsPDF = async (
  elementRef: HTMLDivElement | null,
  filename: string = "receipt.pdf",
): Promise<void> => {
  await printReceiptToPDF(elementRef, filename);
};

export const isPrintSupported = (): boolean => {
  return typeof window !== "undefined" && typeof window.print === "function";
};
