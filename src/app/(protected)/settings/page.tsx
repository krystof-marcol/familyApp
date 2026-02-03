import SettingsClient from "./SettingsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Settings page",
};

export default async function Page() {
  return <SettingsClient />;
}
