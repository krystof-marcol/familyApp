// app/(protected)/family/page.tsx (Server)
import FamilyClient from "./FamilyClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;
  const familyId = session?.user?.familyId;
  const userProvider = session?.user?.provider || "credentials";
  const userName = session?.user?.name || "";
  const userImage = session?.user?.imageUrl || "";
  const userRole = session?.user?.role || "MEMBER";

  if (!userId) return null;
  if (!familyId) return <div className="p-10">No family found.</div>;

  return (
    <FamilyClient
      userId={userId}
      familyId={familyId}
      userProvider={userProvider}
      initialUserName={userName}
      initialUserImage={userImage}
      initialUserRole={userRole}
    />
  );
}
