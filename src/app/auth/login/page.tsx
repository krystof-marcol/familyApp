"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useSidebar } from "@/components/ui/sidebar";
import { useLogin } from "@/hooks/use-login";
import FamilyNameInput from "@/components/input-name";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import Loading from "@/app/loading";
import { isCzechUser } from "@/hooks/detectLanguage";
import en from "@messages/en.json";
import cz from "@messages/cz.json";

export default function LoginPage() {
  const [form, setForm] = useState({ gmail: "", password: "" });
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const { setOpen } = useSidebar();
  const { handleLogin } = useLogin();
  const [loading, setLoading] = useState(false);
  const { status: sessionStatus } = useSession();
  const [language, setLanguage] = useState<"en" | "cz">("en");

  const t = language === "cz" ? cz.Login : en.Login;

  useEffect(() => {
    setOpen(false);
    setLanguage(isCzechUser() ? "cz" : "en");
  }, [setOpen]);

  if (sessionStatus === "loading" || loading) {
    return <Loading />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gmail.includes("@")) {
      setShowAlert(true);
      return;
    }
    setLoading(true);
    await handleLogin(e, form, router);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/auth/signup/family" });
    setLoading(false);
  };

  return (
    <div className="flex justify-center bg-white pt-15 dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-black">
        <h1 className="mb-6 text-center text-2xl font-semibold">{t.title}</h1>

        {showAlert && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{t.errorTitle}</AlertTitle>
            <AlertDescription>
              <p>{t.errorDesc}</p>
              <ul className="list-inside list-disc text-sm">
                <li>{t.errorRuleAt}</li>
                <li>{t.errorRuleTypos}</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <br />
        <form onSubmit={handleSubmit} className="space-y-4">
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
            id="password"
            type="password"
            placeholder={t.passwordPlaceholder}
          />
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
          {t.noAccountText}{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            {t.signUpLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
