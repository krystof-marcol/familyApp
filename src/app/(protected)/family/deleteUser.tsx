"use client";

import { useMutation } from "@apollo/client";
import { LEAVE_FAMILY } from "@/graphql";
import { useAlert } from "@/components/logic/AlertProvider";
import { useTranslations } from "next-intl";

export function useLeaveFamily() {
  const [leaveFamilyMutation] = useMutation(LEAVE_FAMILY);
  const { showAlert } = useAlert();
  const t = useTranslations("Settings");

  const leaveFamilyFunc = async (userId: string, refetch?: () => void) => {
    if (!userId) return;

    try {
      await leaveFamilyMutation({
        variables: { userId },
      });

      if (refetch) {
        refetch();
      }
      showAlert(`${t("Family.deleteUser")}`);
    } catch (error) {
      console.error("Error leaving family:", error);
    }
  };

  return { leaveFamilyFunc };
}
