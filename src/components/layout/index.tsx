"use client";

import { useEffect, type PropsWithChildren } from "react";
import { Sidebar } from "../sidebar";
import { useGetIdentity, useIsAuthenticated, useLogout } from "@refinedev/core";
import {
  InputWrapper,
  MantineProvider,
  TableTr,
  createTheme,
} from "@mantine/core";
import { redirect } from "next/navigation";
export const Layout: React.FC<PropsWithChildren> = ({ children }) => {

  const { data, isSuccess, isLoading, isError, refetch } = useIsAuthenticated();

  useEffect(() => {
    if (data) {
      if (!data.authenticated) {
        redirect("/auth/login");
      }
    }
  }, [data]);
  const theme = createTheme({
    /** Put your mantine theme override here */
    components: {
      Button: {
        styles: (theme: any) => ({
          root: {
            fontWeight: "normal", // Set button font weight to normal
          },
        }),
      },
      InputWrapper: {
        styles: (theme: any) => ({
          description: {
            color: "#000",
            paddingBottom: 4,
          },
        }),
      },
      Input: {
        styles: (theme: any) => ({
          input: {
            backgroundColor: "transparent", // Set your desired background color here
          },
        }),
      },
      Table: {
        styles: (theme: any) => ({
          td: {
            backgroundColor: "transparent", // Set your desired background color here
            fontSize: "14px",
          },
          th: {
            backgroundColor: "#f5f6f6", // Set your desired background color here
            fontSize: "12px",
          },
        }),
      },
    },
  });
  return (
    <MantineProvider theme={theme}>
      <div className="flex h-screen">
        <Sidebar />
        <div className="w-full h-screen flex flex-col">
          <div className="bg-[#f8f9f9] flex-1">{children}</div>
        </div>
      </div>
    </MantineProvider>
  );
};
