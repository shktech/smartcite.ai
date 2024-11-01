"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  TagsInput,
  TextInput,
} from "@mantine/core";
import {
  GetManyResponse,
  useCreate,
  useDelete,
  useTable,
  useUpdate,
} from "@refinedev/core";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
export interface CaseResponseDto {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  uploadedDocumentsCount: number;
  citationsCount: number;
  client?: string;
  assignedLawyer?: string;
  status?: string;
}
import { Layout as BaseLayout } from "@components/layout";
import { getFormatedDate } from "@utils/util.functions";
import {
  IconArrowLeft,
  IconEdit,
  IconMoodEmpty,
  IconPencilMinus,
  IconSearch,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
const MatterStates = ["Opened", "In Progress", "Close"];
const ClientRoles = ["Petitioner", "Respondent"];

export default function BlogPostList() {
  const lawyers = [
    "John Doe",
    "Micael Davis",
    "Emily Turner",
    "James Mitchell",
  ];
  const { mutate: createMutate } = useCreate();
  const { mutate: UpdateMutate } = useUpdate();
  const { mutate: deleteMutate } = useDelete();
  const [matterState, setMatterState] = useState<string>(MatterStates[0]);
  const [assignedLawyers, setAssignedLawyers] = useState<string[]>([]);
  const [clientRole, setClientRole] = useState(ClientRoles[0]);
  const handleSave = () => {};

  const handleCancel = () => {};

  const form = useForm({
    initialValues: {
      title: "",
      client: "",
    },

    validate: {},
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.validate().hasErrors) {
      return;
    }
    const payload = {
      title: form.values.title,
      client: form.values.client,
      clientRole: clientRole,
      assignedLawyers: assignedLawyers.join(","),
      state: matterState,
    };
    createMutate(
      {
        resource: "cases",
        values: payload,
      },
      {
        onError: (error) => console.log(error),
        onSuccess: () => {
          close();
        },
      }
    );
  };

  const handleMatterStateChange = (ms: string | null) => {
    setMatterState(ms as string);
  };
  return (
    <BaseLayout>
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
                placeholder="Pick value"
                defaultValue={"Opened"}
                data={MatterStates}
                onChange={handleMatterStateChange}
                styles={{
                  input: {
                    backgroundColor: "white", // Customize the background color
                    width: "140px",
                  },
                }}
              />
              <Button
                variant="default"
                color="dark.6"
                type="submit"
                onClick={handleSave}
                style={{ borderColor: "black" }}
              >
                Cancel
              </Button>
              <Button
                variant=""
                color="dark.6"
                type="submit"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 mt-6">
            <div className="text-xl text-[#292929]">General Information</div>
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  required
                  label="Title"
                  placeholder="Enter title here"
                  value={form.values.title}
                  onChange={(event) =>
                    form.setFieldValue("title", event.currentTarget.value)
                  }
                  error={form.errors.title}
                  radius="sm"
                  labelProps={{
                    style: { color: "black", marginBottom: "6px" },
                  }}
                />
                <TextInput
                  required
                  label="Client"
                  placeholder="Enter client here"
                  value={form.values.client}
                  onChange={(event) =>
                    form.setFieldValue("client", event.currentTarget.value)
                  }
                  error={form.errors.client}
                  radius="sm"
                  labelProps={{
                    style: { color: "black", marginBottom: "6px" },
                  }}
                />
                <Select
                  label="Client Role"
                  placeholder="Client Role"
                  defaultValue={"Petitioner"}
                  required
                  data={["Petitioner", "Respondent"]}
                  styles={{
                    input: {
                      backgroundColor: "white", // Customize the background color
                    },
                    label: {
                      color: "black", // Customize the label color
                      marginBottom: "6px",
                    },
                  }}
                />
                <TagsInput
                  label="Assigned Lawyer"
                  required
                  placeholder="Assigned Lawyer"
                  data={lawyers}
                  value={assignedLawyers}
                  onChange={setAssignedLawyers}
                  acceptValueOnBlur
                  styles={{
                    input: {
                      backgroundColor: "white", // Customize the background color
                    },
                    label: {
                      color: "black", // Customize the label color
                      marginBottom: "6px",
                    },
                  }}
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 mt-6">
            <div className="flex justify-between">
              <div className="text-xl text-[#292929]">Document List</div>
              <Button
                variant="default"
                color="dark.6"
                type="submit"
                leftSection={<IconUpload size={14} />}
              >
                Upload document
              </Button>
            </div>
            <div className="mt-6 bg-white rounded-xl border">
              <div className="border-b flex items-center p-3 gap-2">
                <div className="px-2">#</div>
                <div className="flex-1 px-2">Document Name</div>
                <div className="px-2">Actions</div>
              </div>
              <div className="h-[200px] flex items-center justify-center flex-col">
                <IconMoodEmpty color="black" size={64} />
                <div className="text-xl text-[#292929]">
                  Main Document List is Empty
                </div>
                <div className="text-[#7c7c7c] py-1">
                  Drag your file into this box or click Upload Document to get
                  started
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </BaseLayout>
  );
}
