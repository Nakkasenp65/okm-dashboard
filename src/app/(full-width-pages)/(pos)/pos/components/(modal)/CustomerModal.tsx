"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import {
  FaArrowLeft,
  FaSearch,
  FaUser,
  FaMapMarkerAlt,
  FaStar,
  FaLine,
  FaQrcode,
  FaMobileAlt,
  FaEnvelope,
  FaIdCard,
  FaImage,
  FaSync,
} from "react-icons/fa";
import ConfirmationModal from "./ConfirmationModal";
import { useConfirmation } from "../../hooks/useConfirmation";
import PosAddressForm from "./PosAddressForm";
import { Customer, CustomerLevelType, StructuredAddress } from "../../types/Pos";

// --- Type Definitions ---
interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
  customers: Customer[];
  onAddNewCustomer: (customer: Customer) => void;
}

const levelDetails = {
  ทั่วไป: { emoji: "👤", color: "from-gray-400 to-gray-600" },
  Silver: { emoji: "🥈", color: "from-gray-300 to-slate-500" },
  Gold: { emoji: "🥇", color: "from-yellow-400 to-amber-600" },
  Platinum: { emoji: "💎", color: "from-cyan-400 to-blue-600" },
  Diamond: { emoji: "👑", color: "from-pink-400 to-rose-600" },
};

const ITEMS_PER_PAGE = 5;

// --- Add New Customer Form Sub-component ---
const AddNewCustomerForm = ({
  onBack,
  onSave,
  onShowError,
}: {
  onBack: () => void;
  onSave: (newCustomer: Customer) => void;
  onShowError: (message: string) => void;
}) => {
  // State: Registration Mode ('manual' | 'line')
  const [registrationMode, setRegistrationMode] = useState<"manual" | "line">("manual");

  // State: Standard Form Data
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerCitizenId, setNewCustomerCitizenId] = useState("");
  const [newCustomerAge, setNewCustomerAge] = useState("");
  const [newCustomerLevel, setNewCustomerLevel] = useState<CustomerLevelType>("ทั่วไป");
  const [newCustomerPoint, setNewCustomerPoint] = useState("");
  const [newCustomerNotes, setNewCustomerNotes] = useState("");
  const [newCustomerStructuredAddress, setNewCustomerStructuredAddress] = useState<StructuredAddress>({
    addressDetails: "",
    subdistrict: "",
    district: "",
    province: "",
    postcode: "",
  });

  // State: LINE Specific Data (เพิ่มเข้ามาใหม่)
  const [lineDisplayName, setLineDisplayName] = useState("");
  const [lineUserId, setLineUserId] = useState("");
  const [lineEmail, setLineEmail] = useState("");
  const [linePictureUrl, setLinePictureUrl] = useState(""); // URL รูปโปรไฟล์

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unusedSetter = { setLineDisplayName, setLineUserId, setLinePictureUrl };

  // Logic: Address Handler
  const handleAddressChange = useCallback((field: keyof StructuredAddress, value: string) => {
    setNewCustomerStructuredAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Logic: Save Handler
  const handleSave = () => {
    if (!newCustomerName.trim()) {
      onShowError("กรุณากรอกชื่อลูกค้า");
      return;
    }
    const details = levelDetails[newCustomerLevel];

    const { addressDetails, subdistrict, district, province, postcode } = newCustomerStructuredAddress;
    const formattedAddress = [
      addressDetails,
      subdistrict && `ต./แขวง ${subdistrict}`,
      district && `อ./เขต ${district}`,
      province && `จ.${province}`,
      postcode,
    ]
      .filter(Boolean)
      .join(" ");

    // รวมข้อมูล Line เข้าไปใน notes หรือ field พิเศษ (ขึ้นอยู่กับ Data Structure จริง)
    // ในที่นี้ผมจะรวมไว้ใน notes เพื่อให้เห็นภาพว่ามีการบันทึก
    const finalNotes = [
      newCustomerNotes,
      lineUserId ? `[LINE ID: ${lineUserId}]` : "",
      lineEmail ? `[LINE Email: ${lineEmail}]` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || "-",
      citizenId: newCustomerCitizenId.trim() || undefined,
      address: formattedAddress.trim() || undefined,
      age: newCustomerAge ? parseInt(newCustomerAge, 10) : undefined,
      level: newCustomerLevel,
      customerPoint: newCustomerPoint ? parseInt(newCustomerPoint, 10) : 0,
      notes: finalNotes,
      memberId: `NEW${Date.now().toString().slice(-4)}`,
      emoji: details.emoji,
      color: details.color,
      // image: linePictureUrl // ถ้า Type Customer รองรับ image ก็ใส่ตรงนี้ได้เลย
    };
    onSave(newCustomer);
  };

  // Effect: จำลองการรับข้อมูลเมื่อเปิดโหมด LINE (Demo Purpose)
  // ในการใช้งานจริง ส่วนนี้จะถูกแทนที่ด้วยการ Fetch Data จาก API หรือ WebSocket
  useEffect(() => {
    if (registrationMode === "line") {
      // Example: Reset fields or prepare for incoming data
      // console.log("Waiting for LINE webhook data...");
    }
  }, [registrationMode]);

  return (
    <div className="space-y-6 rounded-lg p-4 dark:bg-gray-900/50">
      {/* === Top Bar === */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack} className="p-2">
            <FaArrowLeft />
          </Button>
          <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {registrationMode === "line" ? "เพิ่มลูกค้าใหม่ (สมัครผ่าน LINE)" : "เพิ่มลูกค้าใหม่ (กรอกเอง)"}
          </h4>
        </div>

        {/* Toggle Button */}
        <div className="flex items-center">
          {registrationMode === "manual" ? (
            <Button
              variant="outline"
              onClick={() => setRegistrationMode("line")}
              className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
            >
              <FaLine className="text-lg" />
              สมัครด้วย LINE
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setRegistrationMode("manual")} className="flex items-center gap-2">
              <FaUser className="text-lg" />
              กรอกข้อมูลเอง
            </Button>
          )}
        </div>
      </div>

      {/* === LINE QR Section (แสดงเฉพาะโหมด LINE) === */}
      {registrationMode === "line" && (
        <div className="animate-in fade-in slide-in-from-top-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <div className="mb-4 flex h-40 w-40 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
            <FaQrcode className="text-7xl text-gray-800 dark:text-white" />
          </div>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <FaSync className="animate-spin" />
            <span className="font-medium">กำลังรอข้อมูลจากลูกค้า...</span>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            ให้ลูกค้าสแกน QR Code เพื่อกรอกข้อมูลผ่าน LINE LIFF <br />
            ข้อมูลจะปรากฏในแบบฟอร์มด้านล่างโดยอัตโนมัติเมื่อลูกค้ากดยืนยัน
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-gray-400 shadow-sm dark:bg-gray-800">
            <FaMobileAlt />
            <span>กำลังส่งสัญญาณภาพไปยังจอ POS Extra...</span>
          </div>
        </div>
      )}

      {/* === LINE Information Fields (แสดงเฉพาะโหมด LINE) === */}
      {registrationMode === "line" && (
        <div className="animate-in fade-in space-y-4 duration-500">
          <h5 className="flex items-center gap-3 text-lg font-semibold text-green-600 dark:text-green-400">
            <FaLine />
            ข้อมูลบัญชี LINE
          </h5>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border border-green-200 bg-white p-4 sm:grid-cols-2 dark:border-green-900 dark:bg-gray-800">
            {/* Profile Picture Display */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">รูปโปรไฟล์</label>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-green-100 dark:bg-gray-700 dark:ring-green-900">
                  {linePictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={linePictureUrl} alt="Line Profile" className="h-full w-full object-cover" />
                  ) : (
                    <FaImage className="text-gray-400" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {linePictureUrl ? "ได้รับรูปโปรไฟล์แล้ว" : "รอรูปโปรไฟล์..."}
                </div>
              </div>
            </div>

            {/* Line User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">LINE Display Name</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaIdCard className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={lineDisplayName}
                  readOnly
                  placeholder="รอข้อมูล..."
                  className="w-full rounded-lg border-gray-300 bg-gray-50 p-3 pl-10 text-base text-gray-500 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                />
              </div>
            </div>

            {/* Line User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">LINE User ID</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaIdCard className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={lineUserId}
                  readOnly
                  placeholder="รอข้อมูล..."
                  className="w-full rounded-lg border-gray-300 bg-gray-50 p-3 pl-10 text-base text-gray-500 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                />
              </div>
            </div>

            {/* Line Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">LINE Email Address</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={lineEmail}
                  onChange={(e) => setLineEmail(e.target.value)}
                  placeholder="รอข้อมูล..."
                  className="w-full rounded-lg border-gray-300 bg-white p-3 pl-10 text-base shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Section 1: Personal Info (Standard Form - Always Visible) === */}
      <div className="space-y-4">
        <h5 className="flex items-center gap-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
          <FaUser className="text-purple-500" />
          ข้อมูลส่วนตัว
        </h5>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-700">
          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              ชื่อ-นามสกุล<span className="text-red-500">*</span>
            </label>
            <input
              id="customer-name"
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="เช่น สมชาย ใจดี"
              className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div>
            <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              เบอร์โทรศัพท์
            </label>
            <input
              id="customer-phone"
              type="text"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
              placeholder="เช่น 0812345678"
              className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="customer-citizen-id" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              รหัสบัตรประชาชน
            </label>
            <input
              id="customer-citizen-id"
              type="text"
              value={newCustomerCitizenId}
              onChange={(e) => setNewCustomerCitizenId(e.target.value)}
              placeholder="เลข 13 หลัก"
              className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* === Section 2: Address === */}
      <div className="space-y-4">
        <h5 className="flex items-center gap-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
          <FaMapMarkerAlt className="text-blue-500" />
          ที่อยู่
        </h5>
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <PosAddressForm addressData={newCustomerStructuredAddress} onAddressChange={handleAddressChange} />
        </div>
      </div>

      {/* === Section 3: Membership Details === */}
      <div className="space-y-4">
        <h5 className="flex items-center gap-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
          <FaStar className="text-amber-500" />
          ข้อมูลสมาชิก
        </h5>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-700">
          <div>
            <label htmlFor="customer-level" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              ระดับสมาชิก
            </label>
            <select
              id="customer-level"
              value={newCustomerLevel}
              onChange={(e) => setNewCustomerLevel(e.target.value as CustomerLevelType)}
              className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="ทั่วไป">ทั่วไป</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Diamond">Diamond</option>
            </select>
          </div>
          <div>
            <label htmlFor="customer-age" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              อายุ
            </label>
            <input
              id="customer-age"
              type="number"
              value={newCustomerAge}
              onChange={(e) => setNewCustomerAge(e.target.value)}
              placeholder="เช่น 35"
              className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="customer-point" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              คะแนนสะสม
            </label>
            <input
              id="customer-point"
              type="number"
              value={newCustomerPoint}
              onChange={(e) => setNewCustomerPoint(e.target.value)}
              placeholder="เช่น 100"
              className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="customer-notes" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              หมายเหตุ
            </label>
            <textarea
              id="customer-notes"
              value={newCustomerNotes}
              onChange={(e) => setNewCustomerNotes(e.target.value)}
              rows={2}
              placeholder="เช่น ลูกค้าประจำ, ต้องการใบกำกับภาษี..."
              className="mt-1 w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-md hover:from-green-600 hover:to-emerald-700 sm:w-auto"
          variant="primary"
        >
          บันทึกและเพิ่มลูกค้า
        </Button>
      </div>
    </div>
  );
};

// --- Main Customer Modal Component ---
export default function CustomerModal({
  isOpen,
  onClose,
  onSelectCustomer,
  customers,
  onAddNewCustomer,
}: CustomerModalProps) {
  const [view, setView] = useState<"list" | "add">("list");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("5");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const confirmation = useConfirmation();

  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    if (levelFilter !== "all") {
      filtered = filtered.filter((customer) => customer.level === levelFilter);
    }

    const searchTerm = searchQuery.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.phone.includes(searchTerm) ||
          customer.memberId.toLowerCase().includes(searchTerm),
      );
    }

    return filtered;
  }, [customers, searchQuery, levelFilter]);

  const { paginatedCustomers, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return {
      paginatedCustomers: filteredCustomers.slice(startIndex, endIndex),
      totalPages: totalPages > 0 ? totalPages : 1,
    };
  }, [filteredCustomers, currentPage]);

  const handleConfirmSelection = () => {
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    if (selectedCustomer) {
      onSelectCustomer(selectedCustomer);
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, levelFilter]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        showCloseButton={false}
        className="no-scrollbar flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl p-4 shadow-2xl"
      >
        <div className="flex h-full flex-col gap-4">
          {view === "list" && (
            <>
              <h3 className="border-b border-gray-200 pb-4 text-2xl font-bold text-gray-800 dark:border-gray-700 dark:text-white">
                จัดการข้อมูลลูกค้า
              </h3>
              <div className="mt-2 flex flex-1 flex-col overflow-hidden">
                <div className="mb-4 grid shrink-0 grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="relative md:col-span-2">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <FaSearch className="text-gray-400" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาด้วยชื่อ, เบอร์โทร, หรือรหัสสมาชิก..."
                      className="w-full rounded-lg border-gray-300 bg-white p-3 pl-10 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="w-full rounded-lg border-gray-300 bg-white p-3 text-base shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="all">ทุกระดับสมาชิก</option>
                    {Object.keys(levelDetails).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden flex-1 overflow-auto rounded-lg border border-gray-200 md:block dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          ลูกค้า
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          ข้อมูลติดต่อ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          ระดับ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          เลือก
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                      {paginatedCustomers.length > 0 ? (
                        paginatedCustomers.map((customer) => (
                          <tr
                            key={customer.id}
                            className={`${
                              selectedCustomerId === customer.id
                                ? "bg-purple-50 dark:bg-purple-950/40"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xl shadow-md ${customer.color}`}
                                >
                                  {customer.emoji}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">{customer.name}</div>
                                  <div className="font-mono text-sm text-gray-500 dark:text-gray-400">
                                    {customer.memberId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {customer.phone}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <span
                                className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold text-white shadow-sm ${customer.color}`}
                              >
                                {customer.level}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <Button
                                size="sm"
                                variant={selectedCustomerId === customer.id ? "primary" : "outline"}
                                onClick={() => setSelectedCustomerId(customer.id)}
                              >
                                เลือก
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                            ไม่พบข้อมูลลูกค้าที่ตรงกับเงื่อนไข
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="block flex-1 space-y-3 overflow-y-auto md:hidden">
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className={`rounded-lg border-2 p-4 transition-all ${
                          selectedCustomerId === customer.id
                            ? "border-purple-500 bg-purple-50 shadow-md dark:border-purple-400 dark:bg-purple-950/40"
                            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-2xl shadow-md ${customer.color}`}
                          >
                            {customer.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{customer.name}</h4>
                                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                  {customer.memberId}
                                </p>
                              </div>
                              <span
                                className={`rounded-full bg-gradient-to-r px-2.5 py-0.5 text-xs font-bold text-white shadow-sm ${customer.color}`}
                              >
                                {customer.level}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">📞 {customer.phone}</div>
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant={selectedCustomerId === customer.id ? "primary" : "outline"}
                                onClick={() => setSelectedCustomerId(customer.id)}
                                className="w-full py-2.5 text-sm font-medium"
                              >
                                {selectedCustomerId === customer.id ? "✓ เลือกแล้ว" : "เลือก"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                      ไม่พบข้อมูลลูกค้าที่ตรงกับเงื่อนไข
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <Button
                    onClick={() => setView("add")}
                    variant="outline"
                    className="py-2.5 text-sm font-medium md:py-2 md:text-base"
                  >
                    เพิ่มลูกค้าใหม่
                  </Button>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="flex-1 py-2.5 text-sm font-medium sm:flex-none md:py-2 md:text-base"
                    >
                      ก่อนหน้า
                    </Button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      หน้า {currentPage} / {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= totalPages}
                      variant="outline"
                      className="flex-1 py-2.5 text-sm font-medium sm:flex-none md:py-2 md:text-base"
                    >
                      ถัดไป
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <Button variant="outline" onClick={onClose} className="py-3 text-sm font-medium md:text-base">
                  ยกเลิก
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmSelection}
                  disabled={!selectedCustomerId}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 py-3 text-sm font-semibold shadow-lg transition-all hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 md:text-base"
                >
                  ยืนยันเลือกลูกค้า
                </Button>
              </div>
            </>
          )}

          {view === "add" && (
            <div className="flex-1 overflow-y-auto pr-2">
              <AddNewCustomerForm
                onBack={() => setView("list")}
                onSave={onAddNewCustomer}
                onShowError={(message) => {
                  confirmation.showConfirmation({
                    title: "ข้อมูลไม่ครบถ้วน",
                    message,
                    type: "warning",
                    confirmText: "ตกลง",
                    showCancel: false,
                  });
                }}
              />
            </div>
          )}
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.hideConfirmation}
        onConfirm={confirmation.config.onConfirm}
        title={confirmation.config.title}
        message={confirmation.config.message}
        type={confirmation.config.type}
        confirmText={confirmation.config.confirmText}
        cancelText={confirmation.config.cancelText}
        showCancel={confirmation.config.showCancel}
      />
    </>
  );
}
