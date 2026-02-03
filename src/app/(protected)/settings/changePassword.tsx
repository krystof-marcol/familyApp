"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { UPDATE_USER_PASSWORD } from "@/graphql";
import { useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useAlert } from "@/components/logic/AlertProvider";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { data: session } = useSession();
  const [changePassword, { loading }] = useMutation(UPDATE_USER_PASSWORD);
  const t = useTranslations("Settings.ChangePassword");
  const { showAlert } = useAlert();

  const userId = session?.user?.id;

  const passwordsMismatch =
    newPassword && confirmPassword && newPassword !== confirmPassword;

  const isSubmitDisabled =
    loading ||
    !oldPassword ||
    !newPassword ||
    !confirmPassword ||
    !!passwordsMismatch;

  const handleSubmit = async () => {
    if (!userId || !oldPassword || !newPassword) {
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert(t("passwordMismatch"));
      return;
    }

    try {
      await changePassword({
        variables: { input: { userId, oldPassword, newPassword } },
      });

      setOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showAlert(t("success"));
    } catch (error: any) {
      console.error("Password change failed:", error);
      showAlert(error.message);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="dark:hover:text-white">
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDesc")}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <Input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder={t("oldPasswordPlaceholder")}
          />
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("newPasswordPlaceholder")}
          />
          <div className="space-y-1">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPasswordPlaceholder")}
              className={cn(
                passwordsMismatch
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "",
              )}
            />
            {passwordsMismatch && (
              <p className="text-xs text-red-500 ml-1">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
