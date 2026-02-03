"use client";

import { useLazyQuery, useMutation } from "@apollo/client";
import {
  CREATE_FAMILY,
  UPDATE_USER_FAMILY,
  GET_FAMILY,
  CREATE_USER,
  UPDATE_USER_ROLE,
} from "@/graphql";
import { useSession } from "next-auth/react";
import { Family } from "@/types";
import { Role } from "@prisma/client";

interface SubmitParams {
  form: {
    familyChoice: "create" | "join";
    familyName: string;
    familyId: string;
    language: string;
  };
  userExist: boolean;
}

export function useFamilySubmit() {
  const [createFamily] = useMutation(CREATE_FAMILY);
  const [createUser] = useMutation(CREATE_USER);
  const [updateUserFamily] = useMutation(UPDATE_USER_FAMILY);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [getFamily] = useLazyQuery<{ family: Family }>(GET_FAMILY);
  const { data: session, update } = useSession();

  const handleSubmit = async ({ form, userExist }: SubmitParams) => {
    if (!session?.user?.email) {
      throw new Error("No session or user email found.");
    }

    let userId: string | null = null;

    if (form.familyChoice === "create" && form.familyName.trim()) {
      if (!userExist) {
        const { data: userData } = await createUser({
          variables: {
            input: {
              name: session.user.name || session.user.email.split("@")[0],
              gmail: session.user.email,
              password: null,
              provider: "google",
              role: Role.ADMIN,
              language: form.language,
            },
          },
        });
        userId = userData?.createUser?.id;
      } else {
        userId = session.user.id;
        updateUserRole({ variables: { input: { userId, role: Role.ADMIN } } });
      }

      const { data: familyData } = await createFamily({
        variables: { input: { name: form.familyName, userId } },
      });

      const familyId = familyData?.createFamily?.id;

      if (userId && familyId) {
        await updateUserFamily({ variables: { input: { userId, familyId } } });
      }

      await update();
      window.location.href = "/";
      return familyData?.createFamily;
    }

    if (form.familyChoice === "join" && form.familyId.trim()) {
      const { data } = await getFamily({
        variables: { id: form.familyId.trim() },
      });

      if (!data?.family) {
        alert("Invalid family ID. Family not found.");
        return;
      }
      if (!userExist) {
        const { data: userData } = await createUser({
          variables: {
            input: {
              name: session.user.name || session.user.email.split("@")[0],
              gmail: session.user.email,
              password: null,
              provider: "google",
              familyId: null,
              role: Role.MEMBER,
              language: form.language,
            },
          },
        });
        userId = userData?.createUser?.id;
      } else {
        userId = session.user.id;
        updateUserRole({ variables: { input: { userId, role: Role.MEMBER } } });
      }

      if (userId) {
        await updateUserFamily({
          variables: { input: { userId, familyId: data.family.id } },
        });
      }

      await update();
      window.location.href = "/";
      return data.family;
    }
  };

  return { handleSubmit };
}
