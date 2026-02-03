import { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Calendar page",
};

export default function Page() {
  return <CalendarClient />;
}
