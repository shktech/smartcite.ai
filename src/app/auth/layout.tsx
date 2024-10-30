"use client";
import authOptions from "@app/api/auth/[...nextauth]/options";
import { createTheme, MantineProvider } from "@mantine/core";
import { useGetIdentity, useNavigation } from "@refinedev/core";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import React from "react";

export default function LoginLayout({
  children,
}: React.PropsWithChildren) {
  const { push } = useNavigation();

  const { data: identity, isLoading } = useGetIdentity<any>();
  if (identity) {
    push("/dashboard");
  }
  return (
    <>
      <MantineProvider>{children}</MantineProvider>
    </>
  );
}

async function getData() {
  const session = await getServerSession(authOptions);

  return {
    session,
  };
}
