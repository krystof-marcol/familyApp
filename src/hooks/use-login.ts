"use client";

import { signIn, useSession } from "next-auth/react";
import { useApolloClient } from "@apollo/client";
import bcrypt from "bcryptjs";
import { GET_USER_BY_GMAIL } from "@/graphql";
import React from "react";
import { useAlert } from "@/components/logic/AlertProvider";

type LoginForm = {
  gmail: string;
  password: string;
};

export function useLogin() {
  const apolloClient = useApolloClient();
  const { update } = useSession();
  const { showAlert } = useAlert();

  const handleLogin = async (
    e: React.FormEvent,
    form: LoginForm,
    router: ReturnType<typeof import("next/navigation").useRouter>,
  ) => {
    e.preventDefault();

    try {
      const { data } = await apolloClient.query({
        query: GET_USER_BY_GMAIL,
        variables: { gmail: form.gmail },
        fetchPolicy: "no-cache",
      });

      const user = data?.userByGmail;
      const familyId = data?.userByGmail?.familyId;

      if (!user) {
        showAlert("User not found");
        return;
      }
      if (!user.password) {
        showAlert("Please login with Google to continue.");
        return;
      }
      const validPassword = await bcrypt.compare(form.password, user.password);
      if (!validPassword) {
        showAlert("Invalid email or password");
        return;
      }
      const result = await signIn("credentials", {
        redirect: false,
        email: form.gmail,
        password: form.password,
      });
      if (result?.error) {
        showAlert(result.error || "Login failed");
        return;
      }
      await update();
      if (!familyId) {
        router.push("/calendar");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      showAlert("Something went wrong. Please try again.");
    }
  };

  return { handleLogin };
}
