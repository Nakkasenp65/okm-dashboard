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

  // Get the element's HTML content
  const printContent = elementRef.innerHTML;

  // Create a new window for printing
  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    throw new Error("Failed to open print window. Please allow popups.");
  }

  // Get page size configurations
  const pageSizeConfig = getPageSizeConfig(options.pageSize || "80mm");

  // Build the complete HTML document for printing
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          @page {
            size: ${pageSizeConfig.width} ${pageSizeConfig.height};
            margin: ${options.margins?.top || 5}mm ${options.margins?.right || 5}mm ${options.margins?.bottom || 5}mm ${options.margins?.left || 5}mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: ${pageSizeConfig.fontSize};
            line-height: ${pageSizeConfig.lineHeight};
            color: #000;
            background: #fff;
            width: ${pageSizeConfig.width};
            padding: 10px;
          }
          
          /* Remove any background colors for print */
          * {
            background: transparent !important;
            color: #000 !important;
          }
          
          /* Print-specific styles */
          @media print {
            body {
              width: 100%;
              margin: 0;
              padding: 5mm;
            }
            
            /* Hide print button if any */
            .no-print {
              display: none !important;
            }
          }
          
          /* Preserve spacing and alignment */
          .flex {
            display: flex;
          }
          
          .justify-between {
            justify-content: space-between;
          }
          
          .justify-center {
            justify-content: center;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          /* Border utilities */
          .border-t {
            border-top: 1px solid #000;
          }
          
          .border-b {
            border-bottom: 1px solid #000;
          }
          
          .border-dashed {
            border-style: dashed;
          }
          
          /* Spacing utilities */
          .mt-1 { margin-top: 0.25rem; }
          .mt-2 { margin-top: 0.5rem; }
          .mt-4 { margin-top: 1rem; }
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
          .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .pt-1 { padding-top: 0.25rem; }
          .pt-2 { padding-top: 0.5rem; }
          .p-2 { padding: 0.5rem; }
          .p-4 { padding: 1rem; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `;

  // Write the content to the new window
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();

      // Close the window after printing (or if user cancels)
      setTimeout(() => {
        printWindow.close();
      }, 500);
    }, 250);
  };
};

/**
 * Get page size configuration based on paper size
 */
const getPageSizeConfig = (pageSize: "80mm" | "58mm" | "A5") => {
  switch (pageSize) {
    case "58mm":
      return {
        width: "58mm",
        height: "auto",
        fontSize: "10px",
        lineHeight: "1.2",
      };
    case "80mm":
      return {
        width: "80mm",
        height: "auto",
        fontSize: "12px",
        lineHeight: "1.4",
      };
    case "A5":
      return {
        width: "148mm",
        height: "210mm",
        fontSize: "12px",
        lineHeight: "1.5",
      };
    default:
      return {
        width: "80mm",
        height: "auto",
        fontSize: "12px",
        lineHeight: "1.4",
      };
  }
};

/**
 * Direct print to thermal printer (if available)
 * Uses browser's native print dialog
 */
export const printToDevice = async (
  elementRef: HTMLDivElement | null,
): Promise<void> => {
  if (!elementRef) {
    throw new Error("No element reference provided for printing");
  }

  // Use the same method as PDF printing
  // The user can select their thermal printer from the print dialog
  await printReceiptToPDF(elementRef, "receipt-print");
};

/**
 * Save receipt as PDF file (download)
 */
export const saveReceiptAsPDF = async (
  elementRef: HTMLDivElement | null,
  filename: string = "receipt.pdf",
): Promise<void> => {
  // For now, this uses the same print mechanism
  // In a production environment, you might use a library like jsPDF or html2pdf
  await printReceiptToPDF(elementRef, filename);
};

/**
 * Check if printing is supported in the current browser
 */
export const isPrintSupported = (): boolean => {
  return typeof window !== "undefined" && typeof window.print === "function";
};
