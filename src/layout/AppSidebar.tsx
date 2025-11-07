"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  FaLine,
  HiMiniSignal,
  FaFileUpload,
  MdGroups,
  IoDocumentTextOutline,
  MdOutlineReceipt,
  TbCloudLock,
  BiReceipt,
  MdPhonelinkLock,
  TbCalendarClock,
  FiPackage,
  FaTruckArrowRight,
  MdOutlinePointOfSale
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const iconSize = "w-5 h-5"

const applicationItems: NavItem[] = [
  {
    icon: <MdGroups className={iconSize} />,
    name: "ข้อมูลผู้ใช้งาน",
    subItems: [
      { name: "รายชื่อทั้งหมด", path: "/users-list", pro: false },
      { name: "อนุมัติแล้ว", path: "/approved-users", pro: false },
      { name: "รออนุมัติ", path: "/pending-users", pro: false },
    ],
  },
  {
    icon: <IoDocumentTextOutline className={iconSize} />,
    name: "สัญญารีไฟแนนซ์",
    subItems: [
      { name: "ทั้งหมด", path: "/contracts-all", pro: false },
      { name: "รอตรวจสอบ", path: "/contracts-pending", pro: false },
      { name: "อนุมัติแล้ว", path: "/contracts-approved", pro: false },
      { name: "ปิดสัญญา", path: "/contracts-closed", pro: false },
      { name: "NPL", path: "/contracts-npl", pro: false },
      { name: "ปฏิเสธแล้ว", path: "/contracts-rejected", pro: false },
    ],
  },
  {
    icon: <MdOutlineReceipt className={iconSize} />,
    name: "สัญญาผ่อนสินค้า",
    subItems: [
      { name: "ทั้งหมด", path: "/installments-all", pro: false },
      { name: "รอตรวจสอบ", path: "/installments-pending", pro: false },
      { name: "อนุมัติแล้ว", path: "/installments-approved", pro: false },
      { name: "ปิดสัญญา", path: "/installments-closed", pro: false },
      { name: "NPL", path: "/installments-npl", pro: false },
      { name: "ปฏิเสธแล้ว", path: "/installments-rejected", pro: false },
    ],
  },
  {
    icon: <TbCloudLock className={iconSize} />,
    name: "สัญญาจำนำไอคลาว",
    subItems: [
      { name: "ทั้งหมด", path: "/icloud-pledge-all", pro: false },
      { name: "รอตรวจสอบ", path: "/icloud-pledge-pending", pro: false },
      { name: "อนุมัติแล้ว", path: "/icloud-pledge-approved", pro: false },
      { name: "ปิดสัญญา", path: "/icloud-pledge-closed", pro: false },
      { name: "NPL", path: "/icloud-pledge-npl", pro: false },
      { name: "ปฏิเสธแล้ว", path: "/icloud-pledge-rejected", pro: false },
    ],
  },
  {
    icon: <BiReceipt className={iconSize} />,
    name: "บิล",
    subItems: [
      { name: "บิลทั้งหมด", path: "/bills-all", pro: false },
      { name: "ติดตามหนี้", path: "/debt-tracking", pro: false },
      { name: "รายการชำระเงิน", path: "/payments-transactions", pro: false },
      { name: "Payload Slip", path: "/payload-slip", pro: false },
      { name: "ตั้งค่าวิธีการชำระ", path: "/setting-payment-methods", pro: false },
    ],
  },
  {
    icon: <MdPhonelinkLock className={iconSize} />,
    name: "ขายฝากเครื่อง",
    subItems: [
      { name: "นำเข้าขายฝากเครื่อง", path: "/pawn-item", pro: false },
      { name: "รายการทรัพย์สินที่ขายฝาก", path: "/all-pawn-item", pro: false },
      { name: "นำเข้าซื้อ-ขายเครื่อง", path: "/add-sell-item", pro: false },
      { name: "รายการซื้อ-ขายเครื่อง", path: "/all-purchase-item", pro: false },
    ],
  },
  {
    icon: <TbCalendarClock className={iconSize} />,
    name: "ระบบนัดหมาย",
    subItems: [
      { name: "รายการคิวและนัดหมาย", path: "/booking", pro: false },
      { name: "นัดหมายนอกสถานที่", path: "/offsite-booking", pro: false },
      { name: "ระบบเรียกคิว", path: "/queue", pro: false },
      { name: "การตั้งค่า", path: "/queue-setting", pro: false },
    ],
  },
  {
    icon: <FiPackage className={iconSize} />,
    name: "ข้อมูลสินค้า",
    subItems: [
      { name: "ราคาประเมิน", path: "/product-appraisal", pro: false },
      { name: "ราคาซ่อม", path: "/product-repair-price", pro: false },
      { name: "ตั้งค่า", path: "/product-settings", pro: false },
    ],
  },
  {
    icon: <FaTruckArrowRight className={iconSize} />,
    name: "ข้อมูลการจัดส่ง",
    subItems: [
      { name: "ที่ต้องจัดส่ง", path: "/shipping-pending", pro: false },
      { name: "รับที่ร้าน", path: "/shipping-store", pro: false },
    ],
  },
  
]

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "แดชบอร์ด",
    subItems: [{ name: "อีคอมเมิร์ซ", path: "/", pro: false }],
  },
  {
    icon: <CalenderIcon />,
    name: "ปฏิทิน",
    path: "/calendar",
  },
  {
    icon: <UserCircleIcon />,
    name: "โปรไฟล์ผู้ใช้",
    path: "/profile",
  },
  {
    name: "ฟอร์ม",
    icon: <ListIcon />,
    subItems: [{ name: "ส่วนประกอบฟอร์ม", path: "/form-elements", pro: false }],
  },
  {
    name: "ตาราง",
    icon: <TableIcon />,
    subItems: [{ name: "ตารางพื้นฐาน", path: "/basic-tables", pro: false }],
  },
  {
    name: "หน้า",
    icon: <PageIcon />,
    subItems: [
      { name: "หน้าเปล่า", path: "/blank", pro: false },
      { name: "ข้อผิดพลาด 404", path: "/error-404", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "แผนภูมิ",
    subItems: [
      { name: "แผนภูมิเส้น", path: "/line-chart", pro: false },
      { name: "แผนภูมิแท่ง", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "ส่วนประกอบ UI",
    subItems: [
      { name: "แจ้งเตือน", path: "/alerts", pro: false },
      { name: "อวาตาร์", path: "/avatars", pro: false },
      { name: "ป้าย", path: "/badge", pro: false },
      { name: "ปุ่ม", path: "/buttons", pro: false },
      { name: "รูปภาพ", path: "/images", pro: false },
      { name: "วิดีโอ", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "การยืนยันตัวตน",
    subItems: [
      { name: "เข้าสู่ระบบ", path: "/signin", pro: false },
      { name: "สมัครสมาชิก", path: "/signup", pro: false },
    ],
  },
];

const toolsItmes: NavItem[] = [
  {
    icon: <FaLine className={iconSize} />,
    name: "LINEOA",
    path: "/chat-message"
  },
  {
    icon: <FaFileUpload className={iconSize} />,
    name: "ฝากรูป",
    subItems: [
      { name: "อัพโหลดไฟล์", path: "/image" },
      { name: "การตั้งค่า", path: "/image-setting" },
    ],
  },
  {
    icon: <HiMiniSignal className={iconSize} />,
    name: "LINE Beacon",
    subItems: [
      {name: "แดชบอร์ด", path: "/beacon-dashboard"}
    ]
  },
  {
    icon: <MdOutlinePointOfSale className={iconSize} />,
    name: "POS",
    path: "/pos"
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others" | "tools"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others" | "tools";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname,isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others" | "tools") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* Application */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Application"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(applicationItems, "main")}
            </div>

            {/* Tools */}
            <div >
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Tools"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(toolsItmes, "tools")}
            </div>

            {/* Others */}
            <div >
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>

          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
