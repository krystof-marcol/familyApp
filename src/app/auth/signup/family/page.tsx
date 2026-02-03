"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FamilyNameInput from "@/components/input-name";
import { useFamilySubmit } from "@/hooks/use-create-join-family";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import apolloClient from "@/lib/apollo-client";
import { GET_USER_BY_GMAIL } from "@/graphql";
import Loading from "@/app/loading";
import { useSidebar } from "@/components/ui/sidebar";
import { isCzechUser } from "@/hooks/detectLanguage";
import en from "@messages/en.json";
import cz from "@messages/cz.json";

type FormState = {
  familyChoice: "create" | "join";
  familyName: string;
  familyId: string;
  language: "en" | "cz";
};

export default function FamilyChoosePage() {
  const [form, setForm] = useState<FormState>({
    familyChoice: "create",
    familyName: "",
    familyId: "",
    language: "" as "en" | "cz",
  });

  const { handleSubmit } = useFamilySubmit();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stillChecking, setStillChecking] = useState(true);
  const { setOpen } = useSidebar();

  const [language, setLanguage] = useState<"en" | "cz">("en");
  const t = language === "cz" ? cz.FamilyChoose : en.FamilyChoose;

  useEffect(() => {
    const detectedLang = isCzechUser() ? "cz" : "en";
    setLanguage(detectedLang);
    setForm((prevForm) => ({
      ...prevForm,
      language: detectedLang,
    }));

    if (sessionStatus !== "authenticated" || !session?.user?.email) return;
    setOpen(false);

    const checkUser = async () => {
      try {
        const { data } = await apolloClient.query({
          query: GET_USER_BY_GMAIL,
          variables: { gmail: session.user.email },
          fetchPolicy: "no-cache",
        });

        if (data.userByGmail?.familyId) {
          router.replace("/");
          return;
        }

        if (data.userByGmail) {
          setUser(true);
        }
        setStillChecking(false);
      } catch (error) {
        console.error("Error checking user:", error);
        setStillChecking(false);
      }
    };
    checkUser();
  }, [session, sessionStatus, router, setOpen]);

  if (sessionStatus === "loading" || stillChecking || loading) {
    return <Loading />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async () => {
    setLoading(true);
    console.log(form.language, "language");
    await handleSubmit({ form, userExist: user });
  };

  return (
    <div className="flex justify-center bg-white pt-15 dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-black">
        <h1 className="mb-6 text-center text-2xl font-semibold">{t.title}</h1>

        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={form.familyChoice === "create" ? "default" : "outline"}
            className="w-1/2 dark:hover:text-white"
            onClick={() => setForm({ ...form, familyChoice: "create" })}
          >
            {t.createBtn}
          </Button>
          <Button
            type="button"
            variant={form.familyChoice === "join" ? "default" : "outline"}
            className="w-1/2 dark:hover:text-white"
            onClick={() => setForm({ ...form, familyChoice: "join" })}
          >
            {t.joinBtn}
          </Button>
        </div>

        {form.familyChoice === "create" ? (
          <FamilyNameInput
            value={form.familyName}
            onChange={handleChange}
            name="familyName"
            label={t.familyName}
            placeholder={t.familyNamePlaceholder}
          />
        ) : (
          <FamilyNameInput
            value={form.familyId}
            onChange={handleChange}
            name="familyId"
            label={t.familyId}
            placeholder={t.familyIdPlaceholder}
          />
        )}

        <Button
          type="button"
          variant="default"
          className="w-full mt-4"
          onClick={onSubmit}
        >
          {t.submitBtn}
        </Button>
      </div>
    </div>
  );
}
