import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OpenLinkButton from "@/components/ui/button/OpenLinkButton";
import { Metadata } from "next";
import Image from "next/image";
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
          <div className="flex flex-col items-center justify-center gap-4">
            <Image
              className="h-24 w-24 rounded-md"
              src="https://rocket.in.th/wp-content/uploads/2023/03/%E0%B8%AA%E0%B8%A3%E0%B8%B8%E0%B8%9B-Line-Official-Account.png"
              alt="Line Official Account"
              width={96}
              height={96}
            />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white/90">
              จัดการแชท LINE Official Account
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              เนื่องจากนโยบายความปลอดภัยของ LINE
              คุณจะไม่สามารถจัดการแชทได้โดยตรงจากหน้านี้
              กรุณาคลิกปุ่มด้านล่างเพื่อเปิดหน้าจัดการแชทในแท็บใหม่
            </p>
            <OpenLinkButton
              variant="primary"
              linkUrl="https://chat.line.biz/U03351d929399d5f59e374695c49fe702"
              className="inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              เปิดแชท LINE Official Account
            </OpenLinkButton>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
