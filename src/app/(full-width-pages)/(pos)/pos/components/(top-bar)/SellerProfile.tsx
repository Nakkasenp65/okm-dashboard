"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from "react";
import { StaffMember } from "../../types/Pos";
import { FaUser, FaCheck, FaTimes } from "react-icons/fa";

interface SellerProfileProps {
  currentSeller: StaffMember;
  allStaff: StaffMember[];
  onSellerChange: (seller: StaffMember) => void;
}

export default function SellerProfile({
  currentSeller,
  allStaff,
  onSellerChange,
}: SellerProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock passwords for demo - ในการใช้งานจริงควรเชื่อมกับระบบ authentication
  const STAFF_PASSWORDS: Record<string, string> = {
    "682dbb68048a75e4ab7f0129": "1234", // rachen
    "mock_admin_2": "5678", // Noppadol
    "mock_admin_3": "admin", // Weerapong
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedStaff(null);
        setPassword("");
        setError("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleStaffSelect = (staff: StaffMember) => {
    if (staff.adminId === currentSeller.adminId) {
      // ถ้าเลือกคนเดิมก็ปิด dropdown
      setIsOpen(false);
      return;
    }
    setSelectedStaff(staff);
    setPassword("");
    setError("");
  };

  const handlePasswordSubmit = () => {
    if (!selectedStaff) return;

    const correctPassword = STAFF_PASSWORDS[selectedStaff.adminId];
    if (password === correctPassword) {
      onSellerChange(selectedStaff);
      setIsOpen(false);
      setSelectedStaff(null);
      setPassword("");
      setError("");
    } else {
      setError("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleCancel = () => {
    setSelectedStaff(null);
    setPassword("");
    setError("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 overflow-hidden">
          {currentSeller.profile_image ? (
            <img src={currentSeller.profile_image} alt={currentSeller.fullName} className="h-full w-full object-cover" />
          ) : (
            <FaUser className="text-sm" />
          )}
        </div>
        <div className="text-left">
          <div className="text-xs text-gray-400">ผู้ขาย</div>
          <div className="font-semibold">{currentSeller.fullName}</div>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
          {!selectedStaff ? (
            // Staff List
            <div className="p-2">
              <div className="mb-2 px-3 py-2 text-sm font-semibold text-gray-400">
                เลือกผู้ขาย
              </div>
              <div className="space-y-1">
                {allStaff.map((staff) => (
                  <button
                    key={staff.adminId}
                    onClick={() => handleStaffSelect(staff)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${staff.adminId === currentSeller.adminId
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full overflow-hidden ${staff.adminId === currentSeller.adminId
                        ? "bg-blue-500"
                        : "bg-gray-700"
                        }`}
                    >
                      {staff.profile_image ? (
                        <img src={staff.profile_image} alt={staff.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <FaUser className="text-sm" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{staff.fullName}</div>
                      <div className="text-xs text-gray-500">
                        รหัส: {staff.staffId || staff.adminId}
                      </div>
                    </div>
                    {staff.adminId === currentSeller.adminId && (
                      <FaCheck className="text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Password Input
            <div className="p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 overflow-hidden">
                  {selectedStaff.profile_image ? (
                    <img src={selectedStaff.profile_image} alt={selectedStaff.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-400">เปลี่ยนเป็น</div>
                  <div className="font-semibold text-white">
                    {selectedStaff.fullName}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  ใส่รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePasswordSubmit();
                    } else if (e.key === "Escape") {
                      handleCancel();
                    }
                  }}
                  placeholder="รหัสผ่านของพนักงาน"
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
                {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
                <p className="mt-2 text-xs text-gray-500">
                  Demo: รหัสของ {selectedStaff.fullName} คือ &quot;
                  {STAFF_PASSWORDS[selectedStaff.adminId]}&quot;
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaCheck />
                  ยืนยัน
                </button>
                <button
                  onClick={handleCancel}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
                >
                  <FaTimes />
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
