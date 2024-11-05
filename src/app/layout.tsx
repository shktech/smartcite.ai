import type { Metadata } from "next";
import React, { Suspense } from "react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { dataProvider } from "@providers/data-provider";
import "@styles/global.css";
import { authProvider } from "@providers/auth-provider";
export const metadata: Metadata = {
  title: "Refine",
  description: "Generated by create refine app",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <Suspense>
            <RefineKbarProvider>
              <Refine
                routerProvider={routerProvider}
                dataProvider={dataProvider}
                authProvider={authProvider}
                resources={[
                  {
                    name: "cases",
                    list: "/cases",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "documents",
                    list: "/documents",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "api-keys",
                    list: "/api-keys",
                    meta: {
                      canDelete: true,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                }}
              >
                {children}
                <RefineKbar />
              </Refine>
            </RefineKbarProvider>
          </Suspense>
        </AntdRegistry>
      </body>
    </html>
  );
}
