import HomeDutiesClient from "./HomeDutiesClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Duties",
  description: "Home Duties page",
};
export default async function Page() {
  return <HomeDutiesClient />;
}
