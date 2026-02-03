"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { SettingRow } from "@/components/ui-line";
import { signOut, useSession } from "next-auth/react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";
import {
  UPDATE_USER_LANGUAGE,
  DELETE_USER,
  UPDATE_USER_COLOR_THEME,
  UPDATE_USER_NOTIFICATION,
  UPDATE_USER_SUBNOTIFICATION,
} from "@/graphql";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChangeNameDialog } from "@/app/(protected)/settings/changeName";
import { ChangePasswordDialog } from "@/app/(protected)/settings/changePassword";
import Loading from "@/app/loading";
import { useLocale } from "use-intl";
import MotionButton from "@/components/ui/motion-button";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SettingsClient() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const { data: session, status } = useSession();

  const userId = session?.user?.id || "";
  const initialNotifyShopList = session?.user?.notifyShopList || false;
  const initialNotification = session?.user?.notification || false;
  const initialNotifyHomeDuty = session?.user?.notifyHomeDuty || false;
  const initialNotifyCalendar = session?.user?.notifyCalendar || false;
  const initialNotifyExpenses = session?.user?.notifyExpenses || false;
  const initialLanguage = session?.user?.language || "";
  const userProvider = session?.user?.provider || "";

  const [notification, setNotification] =
    useState<boolean>(initialNotification);
  const [notifyCalendar, setNotifyCalendar] = useState<boolean>(
    initialNotifyCalendar,
  );
  const [notifyShopList, setNotifyShopList] = useState<boolean>(
    initialNotifyShopList,
  );
  const [notifyHomeDuty, setNotifyHomeDuty] = useState<boolean>(
    initialNotifyHomeDuty,
  );
  const [notifyExpenses, setNotifyExpenses] = useState<boolean>(
    initialNotifyExpenses,
  );

  const { update } = useSession();
  const t = useTranslations("Settings");
  const router = useRouter();
  const locale = useLocale();

  const [updateUserLanguage] = useMutation(UPDATE_USER_LANGUAGE);
  const [deleteUser] = useMutation(DELETE_USER);
  const [updateUserColorTheme] = useMutation(UPDATE_USER_COLOR_THEME);
  const [updateUserNotification] = useMutation(UPDATE_USER_NOTIFICATION);
  const [updateUserSubNotification] = useMutation(UPDATE_USER_SUBNOTIFICATION);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = async (lang: string) => {
    setLoadingAction(true);
    try {
      await updateUserLanguage({
        variables: { input: { userId, language: lang } },
      });
      await update({ language: lang });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  const changeColorTheme = async (nextTheme: string) => {
    if (!mounted) return;
    setTheme(nextTheme);
    await updateUserColorTheme({
      variables: { input: { userId, colorTheme: nextTheme } },
    });
    await update({ colorTheme: nextTheme });
  };

  const changeMasterNotification = async (checked: boolean) => {
    setNotification(checked);
    try {
      if (checked) {
        if (!("Notification" in window)) {
          alert("Notifications are not supported on this browser.");
          setNotification(false);
          return;
        }

        if (!("serviceWorker" in navigator)) {
          alert("Service Workers not supported.");
          return;
        }

        const permission = await window.Notification.requestPermission();
        if (permission !== "granted") {
          alert("Permission denied. Reset permissions in browser settings.");
          setNotification(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY!),
        });

        await fetch("/api/web-push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: subscription,
            title: t("titleNotification"),
            body: t("titleBody"),
          }),
        });
      }

      await updateUserNotification({
        variables: {
          input: {
            userId,
            notification: checked,
          },
        },
      });
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      alert("Something went wrong enabling notifications.");
      setNotification(false);
    }
  };

  const changeSubNotification = async (
    key: "calendar" | "shopList" | "homeDuty" | "expenses",
    value: boolean,
  ) => {
    if (key === "calendar") setNotifyCalendar(value);
    if (key === "shopList") setNotifyShopList(value);
    if (key === "homeDuty") setNotifyHomeDuty(value);
    if (key === "expenses") setNotifyExpenses(value);

    await updateUserSubNotification({
      variables: {
        input: {
          userId,
          notifyCalendar: key === "calendar" ? value : notifyCalendar,
          notifyShopList: key === "shopList" ? value : notifyShopList,
          notifyHomeDuty: key === "homeDuty" ? value : notifyHomeDuty,
          notifyExpenses: key === "expenses" ? value : notifyExpenses,
        },
      },
    });
  };

  const deleteAccount = async () => {
    setLoadingAction(true);
    try {
      await deleteUser({
        variables: { input: { id: userId } },
      });
      await signOut({ callbackUrl: "/auth/signup" });
    } catch (e) {
      console.error(e);
      setLoadingAction(false);
    }
  };

  const handleLogout = async () => {
    setLoadingAction(true);
    await signOut({ callbackUrl: "/auth/login" });
  };

  const nextTheme = resolvedTheme === "light" ? "dark" : "light";

  if (loadingAction) return <Loading />;
  if (!mounted) return null;
  if (status === "loading") {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="h-[80vh] border rounded-md bg-muted/10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto py-6 px-4 md:py-10 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
          {t("title")}
        </h1>

        <div className="space-y-6 md:space-y-8">
          <SettingRow
            title={t("Theme.title")}
            description={t("Theme.desc")}
            action={
              <MotionButton
                onClick={() => changeColorTheme(nextTheme)}
                variant="outline"
                className="capitalize dark:hover:text-white w-full md:w-auto"
              >
                {t(`Theme.button.${nextTheme}`)}
              </MotionButton>
            }
          />

          <SettingRow
            title={t("Language.title")}
            description={t("Language.desc")}
            action={
              <Select value={initialLanguage} onValueChange={changeLanguage}>
                <SelectTrigger className="w-full md:w-[120px] dark:hover:text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cz">Čeština</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <SettingRow
            title={t("Notification.title")}
            description={t("Notification.desc")}
            action={
              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="notification-switch" className="text-sm">
                    {notification
                      ? t("Notification.enabled")
                      : t("Notification.disabled")}
                  </Label>
                  <Switch
                    id="notification-switch"
                    checked={notification}
                    onCheckedChange={changeMasterNotification}
                    disabled={loadingAction}
                  />
                </div>

                <AnimatePresence>
                  {notification && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden flex flex-col items-end gap-2 pr-1 w-full md:w-auto border-r-2 border-gray-100 dark:border-gray-800"
                    >
                      <div className="flex items-center space-x-2 pt-2">
                        <Label
                          htmlFor="notify-calendar"
                          className="text-sm text-muted-foreground text-right"
                        >
                          {t("Notification.calendar")}
                        </Label>
                        <Switch
                          id="notify-calendar"
                          checked={notifyCalendar}
                          onCheckedChange={(val) =>
                            changeSubNotification("calendar", val)
                          }
                          className="scale-90 origin-right"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor="notify-shoplist"
                          className="text-sm text-muted-foreground text-right"
                        >
                          {t("Notification.shopList")}
                        </Label>
                        <Switch
                          id="notify-shoplist"
                          checked={notifyShopList}
                          onCheckedChange={(val) =>
                            changeSubNotification("shopList", val)
                          }
                          className="scale-90 origin-right"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor="notify-homeduty"
                          className="text-sm text-muted-foreground text-right"
                        >
                          {t("Notification.homeDuty")}
                        </Label>
                        <Switch
                          id="notify-homeduty"
                          checked={notifyHomeDuty}
                          onCheckedChange={(val) =>
                            changeSubNotification("homeDuty", val)
                          }
                          className="scale-90 origin-right"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pb-1">
                        <Label
                          htmlFor="notify-expenses"
                          className="text-sm text-muted-foreground text-right"
                        >
                          {t("Notification.expenses")}
                        </Label>
                        <Switch
                          id="notify-expenses"
                          checked={notifyExpenses}
                          onCheckedChange={(val) =>
                            changeSubNotification("expenses", val)
                          }
                          className="scale-90 origin-right"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            }
          />
          {userProvider !== "google" && (
            <SettingRow
              title={t("ChangePassword.title")}
              description={t("ChangePassword.desc")}
              action={<ChangePasswordDialog />}
            />
          )}

          <SettingRow
            title={t("ChangeName.title")}
            description={t("ChangeName.desc")}
            action={<ChangeNameDialog />}
          />

          <SettingRow
            title={t("Profile.title")}
            description={t("Profile.desc")}
            action={
              <MotionButton
                variant="outline"
                className="dark:hover:text-white w-full md:w-auto"
                onClick={() => {
                  router.push("/family");
                }}
              >
                {t("Profile.button")}
              </MotionButton>
            }
          />

          <SettingRow
            title={t("Credit.title")}
            description={t("Credit.desc")}
            action={
              <MotionButton
                variant="outline"
                className="dark:hover:text-white w-full md:w-auto"
                onClick={() => {
                  router.push(`/${locale}/credit`);
                }}
              >
                {t("Credit.button")}
              </MotionButton>
            }
          />

          <SettingRow
            title={t("Logout.title")}
            description={t("Logout.desc")}
            action={
              <MotionButton
                variant="outline"
                className="dark:hover:text-white text-red-600 w-full md:w-auto"
                onClick={handleLogout}
              >
                {t("Logout.button")}
              </MotionButton>
            }
          />

          <SettingRow
            title={t("DeleteAccount.title")}
            description={t("DeleteAccount.desc")}
            action={
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <MotionButton
                    variant="outline"
                    className="dark:hover:text-white text-red-600 w-full md:w-auto"
                  >
                    {t("DeleteAccount.button")}
                  </MotionButton>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("DeleteAccount.dialogTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("DeleteAccount.dialogDesc")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t("DeleteAccount.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAccount}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {t("DeleteAccount.continue")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            }
          />
        </div>
      </div>
    </div>
  );
}
