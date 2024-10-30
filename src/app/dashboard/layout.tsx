"use client";
import authOptions from "@app/api/auth/[...nextauth]/options";
import { Layout as BaseLayout } from "@components/layout";
import { useIsAuthenticated } from "@refinedev/core";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

export default function Layout({ children }: React.PropsWithChildren) {
  const { data, isSuccess, isLoading, isError, refetch } = useIsAuthenticated();

  useEffect(() => {
    if (data) {
      if (!data.authenticated) {
        redirect("/auth/login");
      }
    }
  }, [data]);

  return <BaseLayout>{children}</BaseLayout>;
}
