"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  MultiSelect,
  Select as MantineSelect,
  TextInput,
  LoadingOverlay,
} from "@mantine/core";
import { useCreate, useGetIdentity, useNavigation } from "@refinedev/core";
import Link from "next/link";
import { Layout as BaseLayout } from "@/components/layout";
import { IconArrowLeft } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import {
  getUsersOfOrganization,
  getUserOrganization,
} from "@/services/keycloak/user.service";
import {
  CaseStates,
  CaseStateTextColor,
  ClientRoles,
} from "@/utils/util.constants";
import { Select } from "antd";

interface FormValues {
  title: string;
  client: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export default function CreateCase() {
  const { push } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const { mutate: createMutate } = useCreate();
  const [users, setUsers] = useState<User[]>([]);
  const [matterState, setMatterState] = useState<string>(CaseStates[0]);
  const [assignedLawyers, setAssignedLawyers] = useState<string[]>([]);
  const [clientRole, setClientRole] = useState(ClientRoles[0]);
  const { data: userData } = useGetIdentity<any>();
  const form = useForm<FormValues>({
    initialValues: {
      title: "",
      client: "",
    },
    validate: {
      title: (value) => (!value ? "Title is required" : null),
      client: (value) => (!value ? "Client is required" : null),
    },
  });

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const userOrganizations = await getUserOrganization(
        userData?.sub as string
      );
      const response = await getUsersOfOrganization(userOrganizations[0].id);
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (!userData) return;
    fetchUsers();
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.validate().hasErrors) {
      return;
    }

    setIsLoading(true);

    const payload = {
      title: form.values.title,
      client: form.values.client,
      clientRole,
      assignedLawyers: assignedLawyers.join(","),
      state: matterState,
    };

    createMutate(
      {
        resource: "cases",
        values: payload,
      },
      {
        onError: (error) => {
          console.error(error);
          setIsLoading(false);
          push("/cases");
        },
        onSuccess: () => {
          setIsLoading(false);
          push("/cases");
        },
      }
    );
  };

  const renderFormField = (
    label: string,
    name: keyof FormValues,
    placeholder: string
  ) => (
    <TextInput
      required
      label={label}
      placeholder={placeholder}
      value={form.values[name]}
      onChange={(event) => form.setFieldValue(name, event.currentTarget.value)}
      error={form.errors[name]}
      radius="sm"
      labelProps={{
        style: { color: "black", marginBottom: "6px" },
      }}
    />
  );

  const commonInputStyles = {
    input: { backgroundColor: "white" },
    label: { color: "black", marginBottom: "6px" },
  };

  return (
    <BaseLayout>
      <LoadingOverlay
        visible={isLoading || userLoading}
        zIndex={1000}
        loaderProps={{ color: "black", type: "bars" }}
      />
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/cases"
                className="border rounded-lg p-1.5 border-[#292929]"
              >
                <IconArrowLeft color="#292929" size={24} />
              </Link>
              <div className="text-xl text-[#292929]">Untitled Matter</div>
            </div>
            <div className="flex gap-2">
              <Select
                onChange={setMatterState}
                style={{ width: "120px", height: "100%" }}
                value={matterState}
              >
                {CaseStates.map((state) => (
                  <Select.Option key={state} value={state}>
                    <span style={{ color: CaseStateTextColor[state] }}>
                      {state}
                    </span>
                  </Select.Option>
                ))}
              </Select>
              <Button
                variant="default"
                color="dark.6"
                style={{ borderColor: "black", backgroundColor: "white" }}
                component={Link}
                href="/cases"
              >
                Cancel
              </Button>
              <Button variant="" color="dark.6" type="submit">
                Save
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 mt-6">
            <div className="text-xl text-[#292929]">General Information</div>
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-4">
                {renderFormField("Title", "title", "Enter title here")}
                {renderFormField("Client", "client", "Enter client here")}
                <MantineSelect
                  label="Client Role"
                  placeholder="Client Role"
                  defaultValue={"Petitioner"}
                  required
                  value={clientRole}
                  onChange={(value) => setClientRole(value as string)}
                  data={ClientRoles}
                  styles={commonInputStyles}
                />
                <MultiSelect
                  label="Assigned Lawyer"
                  required
                  placeholder="Assigned Lawyer"
                  data={users.map((user) => ({
                    value: user.id,
                    label: `${user.firstName} ${user.lastName}`,
                  }))}
                  value={assignedLawyers}
                  onChange={setAssignedLawyers}
                  styles={commonInputStyles}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </BaseLayout>
  );
}
