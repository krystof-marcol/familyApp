"use client";

import { useMutation } from "@apollo/client";
import { UPDATE_USER_ROLE } from "@/graphql";
import { useTranslations } from "next-intl";
import { useAlert } from "@/components/logic/AlertProvider";

export function useUpdateUserRole() {
  const [updateUserRoleMutation] = useMutation(UPDATE_USER_ROLE);
  const t = useTranslations("FamilyPage");
  const { showAlert } = useAlert();

  const updateUserRoleFunc = async (
    userId: string,
    newRole: string,
    refetch?: () => void,
  ) => {
    if (!userId || !newRole) return;

    try {
      await updateUserRoleMutation({
        variables: {
          input: {
            userId,
            role: newRole,
          },
        },
      });

      if (refetch) {
        refetch();
      }
      if (newRole === "ADMIN") {
        showAlert(`${t("members.isAdmin")}`);
      } else {
        showAlert(`${t("members.isMember")}`);
      }
    } catch (error) {
      throw error;
    }
  };

  return { updateUserRoleFunc };
}

export class updateUserRoleFunc {}
