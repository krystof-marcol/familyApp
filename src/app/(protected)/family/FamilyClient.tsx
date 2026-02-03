"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_FAMILY_BY_USERID,
  LEAVE_FAMILY,
  UPDATE_USER_IMAGE,
} from "@/graphql";
import { Button } from "@/components/ui/button";
import { SettingRow } from "@/components/ui-line";
import { Copy, LogOut, Pencil, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import { shareInvite } from "@/hooks/shareInvite";
import { useTranslations } from "next-intl";
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
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLeaveFamily } from "@/app/(protected)/family/deleteUser";
import { useUpdateUserRole } from "@/app/(protected)/family/makeAdmin";
import Loading from "@/app/loading";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { AppAvatar } from "@/components/app-avatar";
import { useAlert } from "@/components/logic/AlertProvider";
import MotionButton from "@/components/ui/motion-button";
import { ChangePasswordDialog } from "@/app/(protected)/settings/changePassword";
import { ChangeNameDialog } from "@/app/(protected)/settings/changeName";

type FamilyMember = {
  id: string;
  name: string;
  imageUrl: string | null;
  gmail: string;
  role: string;
};

interface FamilyClientProps {
  userId: string;
  familyId: string;
  userProvider: string;
  initialUserName: string;
  initialUserImage: string;
  initialUserRole: string;
}

export default function FamilyClient({
  userId,
  userProvider,
  initialUserName,
  initialUserImage,
  initialUserRole,
}: FamilyClientProps) {
  const { data: session, update } = useSession();

  const t = useTranslations("FamilyPage");
  const router = useRouter();
  const { showAlert } = useAlert();

  const [leaveFamilyMutation] = useMutation(LEAVE_FAMILY);
  const [updateUserImage] = useMutation(UPDATE_USER_IMAGE);
  const { leaveFamilyFunc } = useLeaveFamily();
  const { updateUserRoleFunc } = useUpdateUserRole();

  const [copied, setCopied] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_FAMILY_BY_USERID, {
    variables: { userId },
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) return <Loading />;
  if (error) return <p>{t("error", { message: error.message })}</p>;

  const family = data?.familyByUserId;
  if (!family) return <p>{t("noFamily")}</p>;

  const handleInvite = async () => {
    const result = await shareInvite();
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(family.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const leaveFamily = async () => {
    setLoadingAction(true);
    let adminCount = 0;
    let users = 0;
    family.members?.forEach((m: FamilyMember) => {
      users++;
      if (m.role === "ADMIN") adminCount++;
    });

    const myRole = session?.user?.role || initialUserRole;

    if (adminCount < 2 && users > 1 && myRole === "ADMIN") {
      showAlert(t("members.minAdmin"));
    } else {
      await leaveFamilyMutation({
        variables: { userId },
      });

      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            familyId: null,
          },
        });
      }
      router.push("/auth/signup/family");
    }
    setLoadingAction(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        showAlert(errorData.error || "Upload failed");
        return;
      }

      const { url } = await response.json();
      const imageUrlString = url.toString();

      await updateUserImage({
        variables: {
          input: {
            userId: userId,
            imageUrl: imageUrlString,
          },
        },
      });

      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            imageUrl: imageUrlString,
          },
        });
      }
      router.refresh();
      await refetch();
    } catch {
      showAlert(t("errorImage"));
    } finally {
      setUploading(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const displayName = session?.user?.name || initialUserName;
  const displayImage = session?.user?.imageUrl || initialUserImage;
  const displayRole = session?.user?.role || initialUserRole;

  if (loadingAction) return <Loading />;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto py-10 px-6">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="relative">
            <AppAvatar
              heights={150}
              widths={150}
              imageUrl={displayImage}
              name={displayName}
            />

            <button
              onClick={openFilePicker}
              disabled={uploading}
              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Pencil className="w-5 h-5 text-white dark:text-black" />
              )}
            </button>
          </div>
        </div>
        <h1 className="text-center">{displayName}</h1>
        <br />
        <h1 className="text-3xl">{family.name}</h1>
        <h4 className="mb-8">{t(`${displayRole}`)}</h4>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        <SettingRow
          title={t("familyId.title")}
          description={t("familyId.desc")}
          action={
            <Button
              onClick={handleCopy}
              variant="outline"
              className="dark:hover:text-white"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? t("familyId.copied") : t("familyId.copy")}
            </Button>
          }
        />

        <br />

        <SettingRow
          title={t("members.title")}
          description={t("members.desc")}
          action={
            <div className="flex gap-2 flex-wrap">
              {family.members.map((m: FamilyMember) => {
                const isCurrentUser = m.id === userId;

                return (
                  <Popover key={m.id}>
                    <PopoverTrigger asChild>
                      <Avatar className="cursor-pointer hover:opacity-80 transition border-2 border-primary">
                        <AvatarImage src={m.imageUrl ?? ""} alt={m.name} />
                        <AvatarFallback>
                          {isCurrentUser
                            ? t("members.you")[0]
                            : m.name
                              ? m.name[0].toUpperCase()
                              : "?"}
                        </AvatarFallback>
                      </Avatar>
                    </PopoverTrigger>

                    <PopoverContent
                      side="top"
                      align="center"
                      className="p-4 w-64 rounded-lg shadow-lg border bg-white dark:bg-neutral-900"
                    >
                      {isCurrentUser ? (
                        <div className="text-sm font-medium">
                          {t("members.you")}
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-medium">{m.name}</div>
                          <div className="text-xs text-gray-500">{m.gmail}</div>
                          <div className="text-xs text-gray-400">{m.role}</div>
                        </>
                      )}

                      {displayRole === "ADMIN" && !isCurrentUser && (
                        <div className="flex justify-between mt-3">
                          <button
                            onClick={() => leaveFamilyFunc(m.id, refetch)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            {t("members.delete")}
                          </button>
                          <button
                            onClick={() =>
                              updateUserRoleFunc(
                                m.id,
                                m.role === "ADMIN" ? "MEMBER" : "ADMIN",
                                refetch,
                              )
                            }
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            {m.role === "ADMIN"
                              ? t("members.makeMember")
                              : t("members.makeAdmin")}
                          </button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>
          }
        />

        <br />

        <SettingRow
          title={t("invite.title")}
          description={t("invite.desc")}
          action={
            <MotionButton
              variant="outline"
              onClick={handleInvite}
              className="dark:hover:text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t("invite.button")}
            </MotionButton>
          }
        />

        <br />

        {userProvider != "google" && (
          <>
            <SettingRow
              title={t("titlePassword")}
              description={t("descPassword")}
              action={<ChangePasswordDialog />}
            />
            <br />
          </>
        )}

        <SettingRow
          title={t("title")}
          description={t("desc")}
          action={<ChangeNameDialog />}
        />

        <br />

        <SettingRow
          title={t("leave.title")}
          description={t("leave.desc")}
          action={
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <MotionButton
                  variant="outline"
                  className="text-red-600 hover:text-red-700 dark:hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("leave.button")}
                </MotionButton>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("leave.dialogTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("leave.dialogDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>{t("leave.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={leaveFamily}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {t("leave.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
        />
      </div>
    </div>
  );
}
