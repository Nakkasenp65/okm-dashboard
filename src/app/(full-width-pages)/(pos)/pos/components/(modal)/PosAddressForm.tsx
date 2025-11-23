"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Combobox, ComboboxOption } from "@/components/ui/combobox/ComboBox";
import { Textarea } from "../../../../../../components/ui/text/textarea";
import useLocationSuggestion from "../../hooks/useLocationSuggestion";
import useZipLocation from "../../hooks/useZipLocation";
import { StructuredAddress } from "../../types/Pos";

interface PosAddressFormProps {
  // ✅ KEY CHANGE: รับข้อมูลที่อยู่แบบละเอียดเป็น props
  addressData: StructuredAddress;
  // ✅ KEY CHANGE: สร้าง callback function เพื่อส่งข้อมูลที่เปลี่ยนแปลงกลับไป
  onAddressChange: (field: keyof StructuredAddress, value: string) => void;
  variants?: "default" | "compact";
}

export default function PosAddressForm({
  addressData,
  onAddressChange,
  variants = "default",
}: PosAddressFormProps) {
  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [amphoeId, setAmphoeId] = useState<number | undefined>();
  const [zipSearch, setZipSearch] = useState("");

  const [debouncedZipSearch] = useDebounce(zipSearch, 400);

  const provinceQ = useLocationSuggestion("", { type: "province", limit: 300 });
  const districtQ = useLocationSuggestion("", {
    type: "amphoe",
    provinceId,
    limit: 300,
  });
  const tambonQ = useLocationSuggestion("", {
    type: "tambon",
    provinceId,
    amphoeId,
    limit: 300,
  });
  const zipQ = useZipLocation(debouncedZipSearch, { limit: 100 });

  // ✅ KEY CHANGE: Effect สำหรับ Sync ID ของจังหวัด/อำเภอ เมื่อข้อมูลจากภายนอกเปลี่ยน
  useEffect(() => {
    if (addressData.province && provinceQ.data) {
      const selectedProvince = provinceQ.data.find(
        (p) =>
          (p.province_name_th ?? p.province_name_en) === addressData.province,
      );
      if (selectedProvince && selectedProvince.province_id !== provinceId) {
        setProvinceId(selectedProvince.province_id);
      }
    }
  }, [addressData.province, provinceQ.data, provinceId]);

  useEffect(() => {
    if (addressData.district && districtQ.data) {
      const selectedDistrict = districtQ.data.find(
        (d) => (d.amphoe_name_th ?? d.amphoe_name_en) === addressData.district,
      );
      if (selectedDistrict && selectedDistrict.amphoe_id !== amphoeId) {
        setAmphoeId(selectedDistrict.amphoe_id);
      }
    }
  }, [addressData.district, districtQ.data, amphoeId]);

  // ✅ KEY CHANGE: แก้ไข handleChange ให้เรียก onAddressChange แทน setFormData
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target as {
      name: keyof StructuredAddress;
      value: string;
    };
    onAddressChange(name, value);

    if (name === "province") {
      onAddressChange("district", "");
      onAddressChange("subdistrict", "");
      onAddressChange("postcode", "");
      setAmphoeId(undefined);
    }
    if (name === "district") {
      onAddressChange("subdistrict", "");
      onAddressChange("postcode", "");
    }
  };

  return (
    <section>
      <div className="space-y-4">
        {/* --- Grid สำหรับ ที่อยู่ส่วนย่อย --- */}
        <div
          className={`grid gap-4 ${variants === "compact" ? "grid-cols-1" : "grid-cols-2"} `}
        >
          {/* --- รหัสไปรษณีย์ --- */}
          <div className="flex w-full flex-col items-start gap-1.5">
            <label>รหัสไปรษณีย์</label>
            <Combobox
              options={(() => {
                const options =
                  zipQ.data?.map((r) => {
                    const zip = r.zip_code ?? "";
                    const tambon = r.tambon_name_th ?? r.tambon_name_en ?? "";
                    const amphoe = r.amphoe_name_th ?? r.amphoe_name_en ?? "";
                    const province =
                      r.province_name_th ?? r.province_name_en ?? "";
                    return {
                      value: zip,
                      label: zip,
                      subLabel: `${tambon} • ${amphoe} • ${province}`,
                      data: r,
                    } as ComboboxOption;
                  }) ?? [];

                if (
                  addressData.postcode &&
                  !options.find((opt) => opt.value === addressData.postcode)
                ) {
                  options.unshift({
                    value: addressData.postcode,
                    label: addressData.postcode,
                    subLabel: `${addressData.subdistrict} • ${addressData.district} • ${addressData.province}`,
                    data: null,
                  });
                }
                return options;
              })()}
              value={addressData.postcode}
              onOptionSelect={(option) => {
                const selectedZip = option.data;
                if (selectedZip) {
                  onAddressChange("postcode", option.value);
                  onAddressChange(
                    "subdistrict",
                    (selectedZip.tambon_name_th as string) ??
                    (selectedZip.tambon_name_en as string) ??
                    "",
                  );
                  onAddressChange(
                    "district",
                    (selectedZip.amphoe_name_th as string) ??
                    (selectedZip.amphoe_name_en as string) ??
                    "",
                  );
                  onAddressChange(
                    "province",
                    (selectedZip.province_name_th as string) ??
                    (selectedZip.province_name_en as string) ??
                    "",
                  );
                  setProvinceId(selectedZip.province_id as number);
                  setAmphoeId(selectedZip.amphoe_id as number);
                }
              }}
              onSearchChange={setZipSearch}
              placeholder="ค้นหาจากรหัสไปรษณีย์"
              searchPlaceholder="พิมพ์เพื่อค้นหา..."
              emptyText="ไม่พบข้อมูล"
            />
          </div>

          {/* --- จังหวัด --- */}
          <div className="flex w-full flex-col items-start gap-1.5">
            <label>จังหวัด</label>
            <select
              id="province"
              name="province"
              value={addressData.province}
              onChange={(e) => {
                handleChange(e);
                const selectedProvince = provinceQ.data?.find(
                  (p) =>
                    (p.province_name_th ?? p.province_name_en) ===
                    e.target.value,
                );
                setProvinceId(selectedProvince?.province_id);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">-- เลือกจังหวัด --</option>
              {provinceQ.data?.map((p) => {
                const label = p.province_name_th ?? p.province_name_en ?? "";
                return (
                  <option key={p.province_id} value={label}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* --- อำเภอ/เขต --- */}
          <div className="flex w-full flex-col items-start gap-1.5">
            <label>อำเภอ/เขต</label>
            <select
              id="district"
              name="district"
              value={addressData.district}
              onChange={(e) => {
                handleChange(e);
                const selectedDistrict = districtQ.data?.find(
                  (d) =>
                    (d.amphoe_name_th ?? d.amphoe_name_en) === e.target.value,
                );
                setAmphoeId(selectedDistrict?.amphoe_id);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
              disabled={!provinceId}
            >
              <option value="">-- เลือกอำเภอ/เขต --</option>
              {districtQ.data?.map((d) => {
                const label = d.amphoe_name_th ?? d.amphoe_name_en ?? "";
                return (
                  <option key={d.amphoe_id} value={label}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* --- ตำบล/แขวง --- */}
          <div className="flex w-full flex-col items-start gap-1.5">
            <label>ตำบล/แขวง</label>
            <select
              id="subdistrict"
              name="subdistrict"
              value={addressData.subdistrict}
              onChange={(e) => {
                handleChange(e);

                // ✅ เมื่อเลือกตำบล ให้เติมรหัสไปรษณีย์อัตโนมัติ
                const selectedTambon = tambonQ.data?.find(
                  (t) => (t.tambon_name_th ?? t.tambon_name_en) === e.target.value
                );

                if (selectedTambon && selectedTambon.zip_code) {
                  onAddressChange("postcode", selectedTambon.zip_code);
                }
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
              disabled={!amphoeId}
            >
              <option value="">-- เลือกตำบล/แขวง --</option>
              {tambonQ.data?.map((t) => {
                const label = t.tambon_name_th ?? t.tambon_name_en ?? "";
                return (
                  <option key={t.tambon_id} value={label}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* --- ที่อยู่ (รายละเอียด) --- */}
        <div className="flex w-full flex-col items-start gap-1.5">
          <label htmlFor="addressDetails">
            รายละเอียดที่อยู่ (อาคาร, หมู่บ้าน, บ้านเลขที่, ถนน, ฯลฯ)
          </label>
          <Textarea
            id="addressDetails"
            name="addressDetails"
            rows={3}
            value={addressData.addressDetails}
            onChange={handleChange}
            className="min-h-20 resize-y"
            placeholder="เช่น 99/9 หมู่ 1 ถ.สุขุมวิท ซ. 101"
          />
        </div>
      </div>
    </section>
  );
}
