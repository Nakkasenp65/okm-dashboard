import { useConfirmation } from "../../hooks/useConfirmation";
import { ConfirmationType } from "./ConfirmationModal";

export const useAlert = () => {
  const confirmation = useConfirmation();

  const showAlert = (
    message: string,
    title: string = "แจ้งเตือน",
    type: ConfirmationType = "info",
  ) => {
    confirmation.showConfirmation({
      title,
      message,
      type,
      confirmText: "ตกลง",
      showCancel: false,
    });
  };

  return {
    showAlert,
    confirmation,
  };
};
