// --- Card Network Data Structure Definition ---
export interface CardNetwork {
  id: string; // A unique identifier, e.g., 'visa'
  name: string; // The display name, e.g., "Visa"
  logo_url: string;
}

// --- Centralized Card Network Information ---
export const CARD_NETWORK_DATA: CardNetwork[] = [
  {
    id: "visa",
    name: "Visa",
    logo_url:
      "https://lh3.googleusercontent.com/d/1yW1sZq0s-Q2M-o1r-A0e-8a_g-F9b_c",
  },
  {
    id: "mastercard",
    name: "Mastercard",
    logo_url:
      "https://lh3.googleusercontent.com/d/1n_T-M_B-d_Q-f_A-r_D-w_B-k_C-l_A-_",
  },
  {
    id: "jcb",
    name: "JCB",
    logo_url:
      "https://lh3.googleusercontent.com/d/1w_v-T_y_U_I_g-I-J_w_E-X-y_Z_z-O7_",
  },
  {
    id: "unionpay",
    name: "UnionPay",
    logo_url:
      "https://lh3.googleusercontent.com/d/1sR7g_tP5r-j-sZg5fFw_eK_g_L3b-J9d_",
  },
  {
    id: "amex",
    name: "American Express",
    logo_url:
      "https://lh3.googleusercontent.com/d/1x_Y-Z_A-b_C-d_E-f_G-h_I-j_K-l_M-_",
  },
];

// Mock logos shown at the bottom, can be the same or a different set
export const DECORATIVE_LOGOS = [
  {
    id: "visa",
    url: "https://lh3.googleusercontent.com/d/1_a-bCDE_f-gHIJ_k-lMNO_p-qRST_u-v",
  },
  {
    id: "ktc",
    url: "https://lh3.googleusercontent.com/d/1-ABC_def-GHI_jkl-MNO_pqr-STU_vwx",
  }, // Replace with actual KTC logo if available
  {
    id: "mastercard",
    url: "https://lh3.googleusercontent.com/d/1_f-gHIJ_k-lMNO_p-qRST_u-v_a-bCDE",
  },
  {
    id: "unionpay",
    url: "https://lh3.googleusercontent.com/d/1-gHIJ_k-lMNO_p-qRST_u-v_a-bCDE_f",
  },
];
