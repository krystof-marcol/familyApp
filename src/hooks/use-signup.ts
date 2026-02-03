"use client";

import { signIn, useSession } from "next-auth/react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  CREATE_USER,
  CREATE_FAMILY,
  UPDATE_USER_FAMILY,
  GET_FAMILY,
  GET_USER_BY_GMAIL,
} from "@/graphql";
import bcrypt from "bcryptjs";
import React from "react";
import { Family } from "@/types";
import { Role } from "@prisma/client";
import { useAlert } from "@/components/logic/AlertProvider";

export function useSignUp() {
  const [createUser] = useMutation(CREATE_USER);
  const [createFamily] = useMutation(CREATE_FAMILY);
  const [updateUserFamily] = useMutation(UPDATE_USER_FAMILY);
  const [getFamily] = useLazyQuery<{ getFamily: Family }>(GET_FAMILY);
  const [getUserByGmail] = useLazyQuery(GET_USER_BY_GMAIL);
  const { update } = useSession();
  const { showAlert } = useAlert();
  let familyId = "";

  const handleSignUpSubmit = async (
    e: React.FormEvent,
    form: {
      name: string;
      gmail: string;
      password: string;
      familyChoice: "create" | "join";
      familyId: string;
      familyName: string;
      language: string;
    },
    router: ReturnType<typeof import("next/navigation").useRouter>,
  ) => {
    e.preventDefault();

    try {
      const hashedPassword = await bcrypt.hash(form.password, 10);
      let userId: string | null = null;
      if (form.familyChoice === "create") {
        const { data } = await getUserByGmail({
          variables: {
            gmail: form.gmail,
          },
        });
        if (data?.userByGmail) {
          showAlert("User with this Gmail already exists");
          return;
        }
        const { data: userData } = await createUser({
          variables: {
            input: {
              name: form.name,
              gmail: form.gmail,
              password: hashedPassword,
              provider: "credentials",
              role: Role.ADMIN,
              language: form.language,
            },
          },
        });

        userId = userData?.createUser?.id;

        const { data: familyData } = await createFamily({
          variables: {
            input: {
              name: form.familyName,
              userId,
            },
          },
        });

        familyId = familyData?.createFamily?.id;

        if (userId && familyId) {
          await updateUserFamily({
            variables: {
              input: {
                userId,
                familyId,
              },
            },
          });
        }
      }

      if (form.familyChoice === "join" && form.familyId.trim()) {
        const { data } = await getFamily({
          variables: { id: form.familyId.trim() },
        });
        familyId = data?.getFamily?.id ?? "";

        if (!data) {
          showAlert("Invalid family ID. Family not found.");
        }

        await createUser({
          variables: {
            input: {
              name: form.name,
              gmail: form.gmail,
              password: hashedPassword,
              provider: "credentials",
              familyId: form.familyId.trim(),
              role: Role.MEMBER,
              language: form.language,
            },
          },
        });
      }
      const result = await signIn("credentials", {
        redirect: false,
        email: form.gmail,
        password: form.password,
      });

      if (result?.error) {
        console.error("Sign in failed", result.error);
        return;
      }

      await update();
      if (!familyId) {
        router.push("/calendar");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return { handleSignUpSubmit };
}
