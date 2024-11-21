"use client";

import React, { useEffect, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { IUser } from "@/types/types";
import { Table, type TableColumnType } from "antd";
import DeleteConfirmModal from "@components/common/DeleteBtnWithConfirmModal";
import { IconInfoCircle, IconTrash } from "@tabler/icons-react";
import {
  getUserOrganization,
  getUsersOfOrganization,
} from "@services/keycloak/user.service";
import { Alert, LoadingOverlay } from "@mantine/core";
import pRetry from "p-retry";
export default function Teams() {
  const [users, setUsers] = useState<IUser[]>([]);
  const { data: userData, isLoading: isUserDataLoading } =
    useGetIdentity<any>();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!userData) return;
    const getOrganizationData = async () => {
      setIsLoading(true);
      try {
        const organizationData = await pRetry(() =>
          getUserOrganization(userData.sub)
        );
        const users = await pRetry(() =>
          getUsersOfOrganization(organizationData[0].id)
        );
        setUsers(users);
      } catch (error) {
        console.error("Failed to fetch organization data:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    getOrganizationData();
  }, [userData]);
  const columns: TableColumnType<IUser>[] = [
    {
      title: "#",
      dataIndex: "",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: IUser, b: IUser) => a.firstName.localeCompare(b.firstName),
      sortDirections: ["ascend", "descend"],
      render: (_, record) => record.firstName + " " + record.lastName,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a: IUser, b: IUser) => a.email.localeCompare(b.email),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (value, record) => (
        <div className="flex gap-2 items-center text-[#c5c5c5]">
          <DeleteConfirmModal
            onDelete={() => console.log(record.id)}
            trigger={
              <div className="cursor-pointer hover:text-[#2e2e2e]">
                <IconTrash size={18} />
              </div>
            }
          />
        </div>
      ),
    },
  ];
  return (
    <div className="mt-2 relative">
      <div className="text-2xl text-[#292929] font-bold pb-4">Teams</div>
      {users.length === 0 && (
        <div className="mb-4">
          <Alert
            variant="light"
            color="yellow"
            title="You are not a member of any team"
            icon={<IconInfoCircle />}
          >
            Please join a team to continue.
          </Alert>
        </div>
      )}
      <div className="text-xs bg-white rounded-lg relative">
        <LoadingOverlay
          visible={isLoading || isUserDataLoading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "black", type: "bars" }}
        />
        <Table<IUser>
          columns={columns}
          dataSource={users}
          components={{
            header: {
              cell: (props: any) => (
                <th
                  {...props}
                  style={{
                    color: "#989898", // Optional
                    padding: "12px 16px", // Adjust these values as needed
                    fontWeight: "semibold",
                  }}
                />
              ),
            },
            body: {
              cell: (props: any) => (
                <td
                  {...props}
                  style={{
                    padding: "6px 16px", // Adjust these values as needed
                    color: "#7c7c7c",
                  }}
                />
              ),
            },
          }}
        />
      </div>
    </div>
  );
}
