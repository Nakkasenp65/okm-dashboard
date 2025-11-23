import {
  FaMoneyBillWave,
  FaUniversity,
  FaQrcode,
  FaCreditCard,
} from "react-icons/fa";
import { PaymentMethod } from "../PaymentModal";

// Used for local display in Planning View
export interface PlannedPayment {
  id: string; // Unique temporary ID for UI (removing item)
  method: string; // Display label
  methodKey: PaymentMethod;
  amount: number;
}

export { type PaymentMethod };

export const ADD_BUTTONS = [
  { method: "cash" as PaymentMethod, label: "เงินสด", icon: FaMoneyBillWave },
  { method: "transfer" as PaymentMethod, label: "ธนาคาร", icon: FaUniversity },
  { method: "online" as PaymentMethod, label: "ออนไลน์", icon: FaQrcode },
  { method: "card" as PaymentMethod, label: "บัตรเครดิต", icon: FaCreditCard },
];