"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  FileButton,
  Input,
  Menu,
  Modal,
  rem,
  Select,
  Table,
  TagsInput,
  TextInput,
} from "@mantine/core";
import {
  GetManyResponse,
  useCreate,
  useDelete,
  useList,
  useOne,
  useParsed,
  useTable,
  useUpdate,
} from "@refinedev/core";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import { Layout as BaseLayout } from "@components/layout";
import { getFormatedDate } from "@utils/util.functions";
import {
  IconArrowLeft,
  IconBaselineDensityMedium,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconLayersSubtract,
  IconMoodEmpty,
  IconPencilMinus,
  IconSearch,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { CaseResponseDto, DocumentResponseDto } from "@/types/types";
import {
  getMediaPresignedUrl,
  uploadFile,
} from "@services/admin-file-upload.service";
import { createDocument } from "@services/document.service";
import { DocType } from "@utils/util.constants";
const MatterStates = ["Opened", "In Progress", "Close"];
const ClientRoles = ["Petitioner", "Respondent"];

export default function BlogPostList() {
  const { params } = useParsed();
  const lawyers = [
    "John Doe",
    "Micael Davis",
    "Emily Turner",
    "James Mitchell",
  ];
  const [selectedMainDocumentId, setSelectedMainDocumentId] =
    useState<string>();
  const caseId = params?.caseId;
  const { data: caseData, isLoading: caseLoading } = useOne<CaseResponseDto>({
    resource: "cases",
    id: params?.caseId,
  });
  const [files, setFiles] = useState<File[] | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<
    { index: number; progress: number }[]
  >([]); // Define type for uploadingFiles

  useEffect(() => {
    if (caseData?.data) {
      const c = caseData.data;
      setMatterState(c.state);
      setAssignedLawyers(c.assignedLawyers.split(","));
      setClientRole(c.clientRole);
      form.setFieldValue("title", c.title);
      form.setFieldValue("client", c.client);
    }
  }, [caseData]);
  const { mutate: createMutate } = useCreate();
  const { mutate: UpdateMutate } = useUpdate();
  const { mutate: deleteMutate } = useDelete();
  const [matterState, setMatterState] = useState<string>(MatterStates[0]);
  const [assignedLawyers, setAssignedLawyers] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [clientRole, setClientRole] = useState(ClientRoles[0]);

  const {
    data: documentData,
    isLoading: documentLoading,
    refetch: refetchDocuments,
  } = useList<any>({
    resource: `cases/${caseId}/documents`,
    hasPagination: false,
  });

  useEffect(() => {
    const d = documentData?.data as any;
    if (d) {
      const allDocuments = d?.items as DocumentResponseDto[];
      setDocuments(allDocuments);
    }
  }, [documentData]);

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
    UpdateMutate(
      {
        resource: "cases",
        id: params?.caseId,
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

  const handleUploadMainFile = async (fs: File[]) => {
    console.log("fs");
    const newDocuments: DocumentResponseDto[] = [];
    setFiles(fs);
    setUploadingFiles(
      fs.map((_, i) => ({
        index: i,
        progress: 0,
      }))
    );

    const uploadPromises = fs.map(async (file, i) => {
      try {
        const presignedUrl = await getMediaPresignedUrl();
        await uploadFile(file, presignedUrl.uploadUrl, (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 99) / (progressEvent.total || 1)
          );
          updateUploadProgress(i, percent);
        });
        const createdDocument = await createDocument(
          caseId,
          presignedUrl.id,
          file.name,
          DocType.MAIN,
          DocType.MAIN
        );
        updateUploadProgress(i, 100);
        newDocuments.push(createdDocument);
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((uf) => uf.index !== i));
        }, 1000);
      } catch (error: any) {
        alert("Failed to upload file: " + error.message);
      }
    });

    await Promise.all(uploadPromises); // Wait for all uploads to complete
    setDocuments([...documents, ...newDocuments]);
  };

  const updateUploadProgress = (index: number, progress: number) => {
    setUploadingFiles((prev) => {
      return prev.map((p) => {
        if (p.index === index) {
          return {
            ...p,
            progress: progress,
          };
        }
        return p;
      });
    });
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleMenuItemClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleUploadMainFile(Array.from(e.target.files || []))}
                accept="image/png,image/jpeg"
                multiple
              />
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button
                    variant="default"
                    color="dark.6"
                    leftSection={<IconUpload size={14} />}
                  >
                    Upload document
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={handleMenuItemClick}>
                    Upload main documents
                  </Menu.Item>
                  <Menu.Item>Upload exhibit</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
            <div className="mt-6 bg-white rounded-xl border">
              <div className="border-b flex items-center p-3 gap-2">
                <div className="px-2">#</div>
                <div className="flex-1 px-2">Document Name</div>
                <div className="px-2">Actions</div>
              </div>
              {/* <div className="h-[200px] flex items-center justify-center flex-col">
                <IconMoodEmpty color="black" size={64} />
                <div className="text-xl text-[#292929]">
                  Main Document List is Empty
                </div>
                <div className="text-[#7c7c7c] py-1">
                  Drag your file into this box or click 'Upload Document' to get
                  started
                </div>
              </div> */}
              {documents
                .filter((doc) => doc.type === DocType.MAIN)
                .map((doc, _i) => (
                  <div
                    key={doc.id}
                    className={`border p-4 border-r-0 flex justify-between items-center cursor-pointer
                  ${
                    selectedMainDocumentId === doc.id
                      ? "text-[#3040d6]"
                      : "text-[#6e6e6e]"
                  } 
                  ${_i === 0 ? "border-t" : "border-t-0"}`}
                  >
                    <div
                      onClick={() => setSelectedMainDocumentId(doc.id)}
                      className="font-bold flex gap-2 items-center cursor-pointer text-sm"
                    >
                      <IconExternalLink
                        style={{ width: rem(20), height: rem(20) }}
                      />
                      {doc.title}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </form>
    </BaseLayout>
  );
}
