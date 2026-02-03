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
import { UPDATE_USER_NAME } from "@/graphql";
import { useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { router } from "next/dist/client";

export function ChangeNameDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();
  const { data: session, update } = useSession();
  const [updateName, { loading }] = useMutation(UPDATE_USER_NAME);
  const t = useTranslations("Settings.ChangeName");

  const userId = session?.user?.id;

  const handleSubmit = async () => {
    if (!userId || !name.trim()) {
      return;
    }

    try {
      await updateName({
        variables: { input: { userId, name: name.trim() } },
      });

      await update({
        ...session,
        user: {
          ...session?.user,
          name: name.trim(),
        },
      });
      setOpen(false);
      router.refresh();
      setName("");
    } catch (error) {
      console.error("Failed to update name:", error);
    }
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
        <div className="py-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("placeholder")}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
