"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Table, TextInput } from "@mantine/core";
import {
  GetManyResponse,
  useCreate,
  useDelete,
  useTable,
  useUpdate,
} from "@refinedev/core";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
// import { DateRangePicker } from '@mantine/dates';


import { Layout as BaseLayout } from "@components/layout";
import { getFormatedDate } from "@utils/util.functions";
import { IconEdit, IconPencilMinus, IconSearch, IconTrash } from "@tabler/icons-react";
import { CaseResponseDto } from "@/types/types";
const caseStates = ["View All", "Opened", "In Progress", "Closed"];
export default function BlogPostList() {
  const { mutate: createMutate } = useCreate();
  const { mutate: UpdateMutate } = useUpdate();
  const { mutate: deleteMutate } = useDelete();
  const [opened, { open, close }] = useDisclosure(false);
  const [caseState, setCaseState] = useState(caseStates[0]);
  const {
    tableQueryResult: { data, isLoading },
    setCurrent,
    setFilters,
    setSorters,
  } = useTable<any>({
    syncWithLocation: false,
  });
  const [newCase, setNewCase] = useState({ title: "", description: "" });
  const [cases, setCases] = useState<CaseResponseDto[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setNewCase({ ...newCase, [name]: value });
  };
  const handleSubmit = () => {
    if (selectedCase) {
      UpdateMutate(
        {
          resource: "cases",
          id: selectedCase as string,
          values: newCase,
        },
        {
          onError: (error) => console.log(error),
          onSuccess: () => close(),
        }
      );
    } else {
      createMutate(
        {
          resource: "cases",
          values: newCase,
        },
        {
          onError: (error) => console.log(error),
          onSuccess: () => {
            close();
          },
        }
      );
    }
  };
  useEffect(() => {
    if (data) {
      setCases(data.items as CaseResponseDto[]);
    }
  }, [data]);
  const handleExtractCitations = async (caseId: string) => {
    const c = cases.find((c) => c.id === caseId);
    const confirmExtract = window.confirm(
      `Are you sure you want to begin citation extraction for case "${c?.title}"?`
    );
    if (!confirmExtract) {
      return;
    }

    createMutate(
      {
        resource: `cases/${caseId}/extract-citations`,
        values: {},
      },
      {
        onError: (error) => console.log(error),
        onSuccess: () => console.log("success"),
      }
    );
  };
  const handleDelete = async (caseId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this case?"
    );
    if (!confirmDelete) {
      return;
    }

    deleteMutate(
      {
        resource: `cases`,
        id: caseId,
      },
      {
        onError: (error) => console.log(error),
        onSuccess: () => console.log("success"),
      }
    );

    const updatedCases = cases.filter((c) => c.id !== caseId);
    setCases(updatedCases);
  };

  const handleCreateModal = () => {
    setSelectedCase(null);
    setNewCase({
      title: "",
      description: "",
    });
    open();
  };
  const handleEditModal = (caseItem: CaseResponseDto) => {
    setSelectedCase(caseItem.id);
    setNewCase({
      title: caseItem.title,
      description: caseItem.description,
    });
    open();
  };
  const handleCloseModal = () => {
    close();
  };

  const handleFilterCaseState = (state: string) => () => {
    setCaseState(state);
  };

  return (
    <BaseLayout>
      <div className="p-6">
        <div className="flex justify-between">
          <div>
            <div className="text-xl text-[#292929] font-bold">
              Matters Management
            </div>
            <div className="text-[#7c7c7c] py-2">
              Quickly access case info and documents
            </div>
          </div>
          <div className="">
            <Button
              variant=""
              color="dark.6"
              type="submit"
              component="a"
              href="/cases/create"
              // onClick={handleCreateModal}
            >
              Add matter
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2 bg-white px-2.5 py-2 rounded-lg">
            {caseStates.map((state) => (
              <div
                onClick={handleFilterCaseState(state)}
                key={state}
                className={`px-4 py-1 text-[#989898] cursor-pointer hover:bg-[#f4f4f4] ${
                  state === caseState && "bg-[#f4f4f4] text-[#353535]"
                } rounded-md`}
              >
                {state}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search"
              leftSection={<IconSearch size={18} color="#adb5bd"/>}
              styles={{
                input: {
                  backgroundColor: "#fff", // Set your desired color here
                  border: 'none',
                  borderRadius: '10px'
                },
              }}
            />
          </div>
        </div>
        <div className="mt-6 text-xs bg-white rounded-xl">
          <Table
            style={{
              border: "1px solid #eeeeef",
              "th, td": {
                fontSize: "16px", // Ensures the table headers and cells follow the font size
              },
            }}
            horizontalSpacing="md"
            verticalSpacing="md"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Client</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>No.Documents</Table.Th>
                <Table.Th>Assigned Lawyer</Table.Th>
                <Table.Th>Created At</Table.Th>
                {/* <Table.Th>Description</Table.Th>
                <Table.Th>Citation</Table.Th>
                <Table.Th>Documents</Table.Th> */}
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {cases.map((caseItem: CaseResponseDto, _i) => (
                <Table.Tr key={caseItem.id}>
                  <Table.Td>{_i + 1}</Table.Td>
                  <Table.Td>
                    <div className="text-[#1576f4] underline">
                      {caseItem.title}
                    </div>
                  </Table.Td>
                  <Table.Td>{caseItem?.client}</Table.Td>
                  <Table.Td>{caseItem?.state}</Table.Td>
                  <Table.Td>{caseItem.uploadedDocumentsCount}</Table.Td>
                  <Table.Td>{caseItem?.assignedLawyers}</Table.Td>
                  <Table.Td>{getFormatedDate(caseItem.createdAt)}</Table.Td>
                  <Table.Td>
                    <div className="flex gap-4 items-center text-[#c5c5c5]">
                      <Link href={`/cases/edit?caseId=${caseItem.id}`} className="cursor-pointer hover:text-[#2e2e2e]">
                        <IconEdit size={20} />
                      </Link>
                      <div className="cursor-pointer hover:text-[#2e2e2e]">
                        <IconTrash size={20} />
                      </div>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
        <Modal
          opened={opened}
          onClose={close}
          title={`${selectedCase ? "Edit" : "Create"}  Case`}
        >
          <div className="flex flex-col gap-4">
            <Input.Wrapper description="Title">
              <Input
                name="title"
                onChange={handleInputChange}
                required
                value={newCase.title}
              />
            </Input.Wrapper>
            <Input.Wrapper description="Description">
              <Input
                name="description"
                onChange={handleInputChange}
                required
                value={newCase.description}
              />
            </Input.Wrapper>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="submit"
                onClick={() => handleSubmit()}
              >
                {selectedCase ? "Edit" : "Create"}
              </Button>
              <Button
                variant="default"
                type="submit"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </BaseLayout>
  );
}
