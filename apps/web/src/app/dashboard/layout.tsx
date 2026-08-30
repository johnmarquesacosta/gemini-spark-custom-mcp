import React from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We can add auth check here later if needed
  return <DashboardLayout>{children}</DashboardLayout>;
}
