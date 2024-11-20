"use client";

import React from "react";
import { Layout as BaseLayout } from "@/components/layout";
import "react-phone-input-2/lib/style.css";
import Profile from "@components/settings/Profile";
import Teams from "@components/settings/Teams";
import ApiKey from "@components/settings/ApiKey";
import { useSearchParams } from "next/navigation";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const menuData = [
    {
      id: 1,
      url: "profile",
      label: "Profile",
      component: <Profile />,
    },
    {
      id: 2,
      url: "teams",
      label: "Teams",
      component: <Teams />,
    },
    {
      id: 3,
      url: "api-keys",
      label: "Api-Keys",
      component: <ApiKey />,
    },
  ];

  const component = menuData.find((item) => item.url === page)?.component || (
    <Profile />
  );

  return (
    <BaseLayout>
      <div className="p-6">
        <div className="text-xl text-[#292929] font-semibold pb-6">
          Settings
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col gap-2 w-64">
            {menuData.map((item) => (
              <div
                key={item.label}
                className={`text-base text-[#292929] cursor-pointer hover:bg-[#e9e9e9] px-4 py-2.5 rounded-lg duration-500 ${
                  page === item.url ? "font-semibold" : ""
                }`}
                onClick={() =>
                  window.history.pushState({}, "", `?page=${item.url}`)
                }
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="w-full">{component}</div>
        </div>
      </div>
    </BaseLayout>
  );
}
