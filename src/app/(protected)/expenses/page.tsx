import ExpensesClient from "./ExpensesClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expenses",
  description: "Expenses page",
};

export default async function Page() {
  return <ExpensesClient />;
}
