"use client";

// MARK: - Imports
import React from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // 1. Import motion และ AnimatePresence

// MARK: - Props Interface
interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

// MARK: - Animation Variants
// สร้าง object สำหรับเก็บค่า animation เพื่อให้โค้ดสะอาดขึ้น
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 50 }, // เริ่มจากด้านล่าง 50px และโปร่งใส
  visible: { opacity: 1, y: 0 }, // เคลื่อนมาที่ตำแหน่งเดิม (y=0) และแสดงผลเต็มที่
  exit: { opacity: 0, y: 50 }, // หายไปโดยเลื่อนลงด้านล่าง
};

// MARK: - Main Component
export default function ImageZoomModal({ isOpen, onClose, imageUrl, altText }: ImageZoomModalProps) {
  // Handler สำหรับการคลิกที่พื้นหลังสีดำ (Overlay) เพื่อปิด Modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Section: Render Logic
  return (
    // 2. ใช้ AnimatePresence ครอบ Modal ทั้งหมดเพื่อเปิดใช้งาน exit animation
    <AnimatePresence>
      {isOpen && (
        // 3. เปลี่ยน div เป็น motion.div และเพิ่ม animation ให้กับ Backdrop
        <motion.div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl"
          aria-modal="true"
          role="dialog"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Close Button: ย้ายปุ่มปิดมาไว้มุมขวาบนของหน้าจอเพื่อการใช้งานที่ดีขึ้น */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-transform hover:scale-110 hover:bg-black/75 focus:ring-2 focus:ring-white focus:outline-none"
            aria-label="ปิดหน้าต่างรูปภาพ"
          >
            <FaTimes size={20} />
          </button>

          {/* 4. เปลี่ยน figure เป็น motion.figure และเพิ่ม animation "Fade Up" */}
          <motion.figure
            onClick={(e) => e.stopPropagation()}
            className="relative"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Image
              src={imageUrl}
              alt={altText}
              width={1920}
              height={1080}
              sizes="(max-width: 768px) 100vw, 90vw"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
              className="rounded-lg shadow-2xl"
            />
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
