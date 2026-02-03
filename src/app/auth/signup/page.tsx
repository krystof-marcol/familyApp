"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import FamilyNameInput from "@/components/input-name";
import { useSignUp } from "@/hooks/use-signup";
import { useSidebar } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import Loading from "@/app/loading";
import { isCzechUser } from "@/hooks/detectLanguage";
import en from "@messages/en.json";
import cz from "@messages/cz.json";

type FamilyChoice = "create" | "join";

interface SignUpForm {
  name: string;
  gmail: string;
  password: string;
  familyChoice: FamilyChoice;
  familyId: string;
  familyName: string;
  language: "en" | "cz";
}

export default function SignUpPage() {
  const { handleSignUpSubmit } = useSignUp();
  const { setOpen } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { status: sessionStatus } = useSession();

  const [language, setLanguage] = useState<"en" | "cz">("en");
  const t = language === "cz" ? cz.SignUp : en.SignUp;

  const [form, setForm] = useState<SignUpForm>({
    name: "",
    gmail: "",
    password: "",
    familyChoice: "create",
    familyId: "",
    familyName: "",
    language: "" as "en" | "cz",
  });

  useEffect(() => {
    setOpen(false);
    const detectedLang = isCzechUser() ? "cz" : "en";
    setLanguage(detectedLang);
    setForm((prevForm) => ({
      ...prevForm,
      language: detectedLang,
    }));
  }, [setOpen]);

  const router = useRouter();

  if (sessionStatus === "loading" || loading) {
    return <Loading />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/auth/signup/family" });
    setLoading(false);
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gmail.includes("@")) {
      setShowAlert(true);
      return;
    }
    setLoading(true);
    await handleSignUpSubmit(e, form, router);
    setLoading(false);
  };

  return (
    <div className="flex justify-center bg-white pt-15 dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-black">
        <h1 className="mb-6 text-center text-2xl font-semibold">{t.title}</h1>

        {showAlert && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{t.alert.title}</AlertTitle>
            <AlertDescription>
              <p>{t.alert.description}</p>
              <ul className="list-inside list-disc text-sm">
                <li>{t.alert.checkAt}</li>
                <li>{t.alert.checkTypos}</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <br />

        <form onSubmit={onSignUp} className="space-y-3">
          <FamilyNameInput
            value={form.name}
            onChange={handleChange}
            label={t.name}
            name="name"
            placeholder={t.namePlaceholder}
          />

          <FamilyNameInput
            value={form.gmail}
            onChange={handleChange}
            label={t.gmail}
            name="gmail"
            placeholder={t.emailPlaceholder}
          />

          <FamilyNameInput
            value={form.password}
            onChange={handleChange}
            label={t.password}
            name="password"
            type="password"
            placeholder={t.passwordPlaceholder}
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant={form.familyChoice === "create" ? "default" : "outline"}
              className="w-full sm:w-1/2 dark:hover:text-white"
              onClick={() => setForm({ ...form, familyChoice: "create" })}
            >
              {t.createFamilyBtn}
            </Button>
            <Button
              type="button"
              variant={form.familyChoice === "join" ? "default" : "outline"}
              className="w-full sm:w-1/2 dark:hover:text-white"
              onClick={() => setForm({ ...form, familyChoice: "join" })}
            >
              {t.joinFamilyBtn}
            </Button>
          </div>

          {form.familyChoice === "create" && (
            <FamilyNameInput
              value={form.familyName}
              onChange={handleChange}
              name="familyName"
              label={t.familyName}
              placeholder={t.familyNamePlaceholder}
            />
          )}

          {form.familyChoice === "join" && (
            <FamilyNameInput
              value={form.familyId}
              onChange={handleChange}
              name="familyId"
              label={t.familyId}
              placeholder={t.familyIdPlaceholder}
            />
          )}

          <Button type="submit" className="w-full">
            {t.submitButton}
          </Button>
        </form>

        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 dark:hover:text-white"
            onClick={handleGoogleSignIn}
          >
            <FcGoogle size={20} />
            {t.googleButton}
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          {t.alreadyAccount}{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:underline"
          >
            {t.signInLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
