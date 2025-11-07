import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OpenLinkButton from "@/components/ui/button/OpenLinkButton";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Bar Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function page() {

  return (
    <div>
      <PageBreadcrumb pageTitle="Chat Message" />
      <div className="space-y-6">
        <ComponentCard title="Overview">
          <div className="flex flex-col gap-4 items-center justify-center">
            
          <img className="w-24 h-24 rounded-md" src="https://rocket.in.th/wp-content/uploads/2023/03/%E0%B8%AA%E0%B8%A3%E0%B8%B8%E0%B8%9B-Line-Official-Account.png" alt="Line Official Account" />
          <h3 className="text-lg font-medium dark:text-white/90 text-gray-900">
            จัดการแชท LINE Official Account
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            เนื่องจากนโยบายความปลอดภัยของ LINE คุณจะไม่สามารถจัดการแชทได้โดยตรงจากหน้านี้ กรุณาคลิกปุ่มด้านล่างเพื่อเปิดหน้าจัดการแชทในแท็บใหม่
          </p>
          <OpenLinkButton variant="primary" linkUrl="https://chat.line.biz/U03351d929399d5f59e374695c49fe702" className="inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
            เปิดแชท LINE Official Account
          </OpenLinkButton>
          </div>

        </ComponentCard>
        
      </div>
    </div>
  );
}
