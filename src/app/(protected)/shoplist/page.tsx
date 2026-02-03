import ShopListClient from "./ShopListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop list",
  description: "Shop list page",
};
export default async function Page() {
  return <ShopListClient />;
}
