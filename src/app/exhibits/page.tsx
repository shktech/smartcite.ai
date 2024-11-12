"use client";

import React, { useEffect, useState } from "react";
import { Input, LoadingOverlay } from "@mantine/core";
import type { TableColumnType } from "antd";
import { useTable } from "@refinedev/core";
import { Layout as BaseLayout } from "@/components/layout";
import { IconClick, IconSearch } from "@tabler/icons-react";
import { ICase, IDocument } from "@/types/types";
import { DocType } from "@/utils/util.constants";
import MyTable from "@/components/common/MyTable";
import { useDisclosure } from "@mantine/hooks";
import AddExhibit from "@/components/exhibit/AddExhibit";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import ExhibitDetailDrawer from "@/components/exhibit/ExhibitDetailDrawer";

// Table Column Definitions
const getMainColumns = (): TableColumnType<any>[] => [
  {
    title: "Case Title",
    dataIndex: "title",
    key: "title",
    render: (title: string) => (
      <div className="underline text-[#056cf3]">{title}</div>
    ),
  },
  {
    title: "No. Exhibits",
    dataIndex: "noExhibits",
    key: "noExhibits",
    render: (_, record) => <div>{record.exhibits.length}</div>,
  },
];

const getExhibitsColumns = (): TableColumnType<any>[] => [
  {
    title: "#",
    dataIndex: "",
    key: "index",
    render: (_, __, index) => <div className="pb-9">{index + 1}</div>,
  },
  {
    title: "Exhibit Name-Description",
    dataIndex: "title",
    key: "title",
    width: "50%",
    render: (title: string) => (
      <>
        <div className="underline text-[#056cf3]">{title}</div>
        <div className="text-[#989898] line-clamp-2 text-xs mt-1">
          This Non-Disclosure Agreement (NDA) is a binding contract between ABC
          Corp and XYZ Inc to protect confidential information shared during
          their collaboration. Both parties agree to keep all proprietary data,
          trade s
        </div>
      </>
    ),
  },
  {
    title: "Cited in - As",
    dataIndex: "",
    key: "ref_as",
    render: () => (
      <>
        <div className="underline text-[#056cf3]">Complaint</div>
        <div className="underline text-[#056cf3]">
          Motion for Summary Judgement
        </div>
        <div className="underline text-[#056cf3]">Motion to Dismiss</div>
        <div className="underline text-[#056cf3]">
          Motion for Summary Judgement
        </div>
      </>
    ),
  },
];

export default function DocumentList() {
  // State Management
  const [searchKey, setSearchKey] = useState("");
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [cases, setCases] = useState<ICase[]>([]);
  const [tableCases, setTableCases] = useState<any[]>([]);
  const [selExh, setSelExh] = useState<any>();

  // Hooks
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const { data: documentData, isLoading: documentLoading } = useTable<any>({
    syncWithLocation: false,
  }).tableQueryResult;

  const { data: caseData, isLoading: caseLoading } = useTable<any>({
    resource: "cases",
    syncWithLocation: false,
  }).tableQueryResult;

  // Event Handlers
  const handleRowHover = (record: any) => setSelExh(record);
  const handleExhibitClick = (record: any) => {
    setSelExh(record);
    openDrawer();
  };

  // Data Processing Effects
  useEffect(() => {
    if (documentData) setDocuments(documentData.items as IDocument[]);
  }, [documentData]);

  useEffect(() => {
    if (caseData) setCases(caseData.items as ICase[]);
  }, [caseData]);

  useEffect(() => {
    if (!cases || !documents) return;

    setTableCases(
      cases
        .filter((c) => c.title.toLowerCase().includes(searchKey.toLowerCase()))
        .map((c) => ({
          key: c.id,
          main: documents.filter(
            (d) => d.caseId === c.id && d.type === DocType.MAIN
          ),
          exhibits: documents.filter(
            (d) => d.caseId === c.id && d.type === DocType.EXHIBIT
          ),
          ...c,
        }))
    );
  }, [cases, documents, searchKey]);


  return (
    <BaseLayout>
      <LoadingOverlay
        visible={documentLoading || caseLoading}
        zIndex={1000}
        loaderProps={{ color: "black", type: "bars" }}
      />

      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between">
          <div>
            <div className="text-xl text-[#292929] font-semibold">
              Exhibits Library
            </div>
            <div className="text-[#7c7c7c] py-2">
              Manage all your exhibits in one place
            </div>
          </div>
          <AddExhibit cases={tableCases} setDocuments={setDocuments} />
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search"
              leftSection={<IconSearch size={18} color="#adb5bd" />}
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              styles={{
                input: {
                  backgroundColor: "#fff",
                  border: "none",
                  borderRadius: "6px",
                },
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 mt-6 gap-4 flex-1">
          <div className="col-span-2 bg-white rounded-xl pb-10">
            <MyTable
              columns={getMainColumns()}
              dataSource={tableCases}
              pagination={false}
              expandable={{
                expandedRowRender: (record: any) => (
                  <div className="ml-10 my-4 border rounded-lg bg-white pb-4">
                    <MyTable
                      columns={getExhibitsColumns()}
                      dataSource={record.exhibits}
                      pagination={false}
                      onRow={(record: any) => ({
                        onClick: () => handleExhibitClick(record),
                        onMouseEnter: () => handleRowHover(record),
                      })}
                    />
                  </div>
                ),
              }}
            />
          </div>

          {/* Preview Panel */}
          <div className="col-span-1 bg-white rounded-xl pb-10 relative">
            {!selExh ? (
              <div className="flex items-center justify-center h-full flex-col gap-2">
                <IconClick size={40} />
                <div className="text-[#292929] mt-4">Exhibit Preview</div>
                <div className="text-[#989898]">
                  Hover over an Exhibit to see a PDF Preview
                </div>
              </div>
            ) : (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={selExh?.mediaUrl}
                  renderLoader={() => (
                    <LoadingOverlay
                      visible={true}
                      zIndex={1000}
                      loaderProps={{ color: "black", type: "bars" }}
                    />
                  )}
                />
              </Worker>
            )}
          </div>
        </div>
      </div>

      <ExhibitDetailDrawer
        opened={drawerOpened}
        close={closeDrawer}
        selExh={selExh}
      />
    </BaseLayout>
  );
}
