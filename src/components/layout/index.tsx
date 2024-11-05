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
            fontSize: "14px",
          },
          th: {
            fontSize: "14px",
            color: "#989898",
            fontWeight: "normal",
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
          <div className="flex-1 relative">{children}</div>
        </div>
      </div>
    </MantineProvider>
  );
};
