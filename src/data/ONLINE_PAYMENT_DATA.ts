// --- Online Payment Method Structure Definition ---
// การกำหนด Type ช่วยให้มั่นใจว่าข้อมูลทั้งหมดมีโครงสร้างที่สอดคล้องกัน
export interface OnlinePaymentMethod {
  id: string; // Unique identifier e.g., 'paotang', 'truemoney'
  name: string; // Display name
  logo_url: string;
  qr_code_url: string; // URL template for generating the QR code
}

// --- Centralized Online Payment Information ---
// ข้อมูลนี้สามารถดึงมาจาก API หรือตั้งค่าจากระบบหลังบ้านได้ในอนาคต
export const ONLINE_PAYMENT_DATA: OnlinePaymentMethod[] = [
  {
    id: "paotang",
    name: "เป๋าตัง (ตัวอย่าง)",
    logo_url:
      "https://lh3.googleusercontent.com/d/1yA5BikM3o-3sW7nB5gXm_F_8a_Z7b-Cg", // Placeholder logo
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=paotang-payment-data",
  },
  {
    id: "wechatpay",
    name: "WeChat Pay",
    logo_url:
      "https://lh3.googleusercontent.com/d/1sR7g_tP5r-j-sZg5fFw_eK_g_L3b-J9d",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=wechatpay-payment-data",
  },
  {
    id: "truemoney",
    name: "True Money Wallet",
    logo_url:
      "https://lh3.googleusercontent.com/d/1w_v-T_y_U_I_g-I-J_w_E-X-y_Z_z-O7",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=truemoney-payment-data",
  },
  {
    id: "linepay",
    name: "Rabbit Line Pay",
    logo_url:
      "https://lh3.googleusercontent.com/d/1n_t-M_B-d_Q-f_A-r_D-w_B-k_C-l_A-",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=linepay-payment-data",
  },
  {
    id: "paypal",
    name: "PayPal",
    logo_url:
      "https://lh3.googleusercontent.com/d/1f_A-b_C-j_B-g_F-h_E-k_D-i_G-j_K-",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=paypal-payment-data",
  },
  {
    id: "airpay",
    name: "ShopeePay (AirPay)",
    logo_url:
      "https://lh3.googleusercontent.com/d/1x_Y-Z_A-b_C-d_E-f_G-h_I-j_K-l_M-",
    qr_code_url:
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=airpay-payment-data",
  },
];
