"use client";

import React, { useEffect, useState } from "react";
import { Input, LoadingOverlay } from "@mantine/core";
import type { TableColumnType } from "antd";
import { useTable } from "@refinedev/core";
import { Layout as BaseLayout } from "@/components/layout";
import { IconClick, IconEye, IconSearch } from "@tabler/icons-react";
import { ICase, ICitation, IDocument } from "@/types/types";
import { DocType } from "@/utils/util.constants";
import MyTable from "@/components/common/MyTable";
import { useDisclosure } from "@mantine/hooks";
import AddExhibit from "@/components/exhibit/AddExhibit";
import ExhibitDetailDrawer from "@/components/exhibit/ExhibitDetailDrawer";
import { getCitations } from "@services/citation.service";
import pRetry from "p-retry";
import { getDocumentsByCaseId } from "@services/document.service";
import PdfViewer from "@components/common/PdfViewer";

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
    title: "No. Main Documents",
    dataIndex: "noMainDocuments",
    key: "noMainDocuments",
    render: (_, record) => <div>{record.main.length}</div>,
  },
];

const getMainDocColumns = (): TableColumnType<any>[] => [
  {
    title: "#",
    dataIndex: "",
    key: "index",
    width: "10%",
    render: (_, __, index) => <div className="">{index + 1}</div>,
  },
  {
    title: "Main Document",
    dataIndex: "title",
    key: "title",
    render: (title: string) => (
      <>
        <div className="underline text-[#056cf3]">{title}</div>
      </>
    ),
  },
  {
    title: "No. Exhibits",
    dataIndex: "noExhibits",
    key: "noExhibits",
    render: (_, record) => <div>{record.exhibits.length}</div>,
  },
  {
    title: "Citations",
    dataIndex: "citationsCount",
    key: "citationsCount",
  },
];

export default function DocumentList() {
  // State Management
  const [searchKey, setSearchKey] = useState("");
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [cases, setCases] = useState<ICase[]>([]);
  const [tableCases, setTableCases] = useState<any[]>([]);
  const [selExh, setSelExh] = useState<any>();
  const [citations, setCitations] = useState<ICitation[]>([]);
  const [docLoading, setDocLoading] = useState(true);
  // Hooks
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [expandedCases, setExpandedCases] = useState<string[]>([]);
  const [expandedMainDocs, setExpandedMainDocs] = useState<string[]>([]);

  const { data: caseData, isLoading: caseLoading } = useTable<any>({
    resource: "cases",
    syncWithLocation: false,
  }).tableQueryResult;

  const handleExhibitClick = (record: any) => {
    setSelExh(record);
  };

  const handleViewDetails = (record: any) => {
    setSelExh(record);
    openDrawer();
  };

  const getCitedInMainDocuments = (exhDocId: string) => {
    const exhDoc = documents.find((doc) => doc.id === exhDocId);
    if (!exhDoc) return [];

    const citedInMainDocInfos = citations
      .filter((citation) => citation.destinationDocumentId === exhDocId)
      .map((citation) => ({
        doc: documents.find((d) => d.id == citation.sourceDocumentId),
        sourceText: citation.sourceText,
      }));
    return citedInMainDocInfos;
  };

  useEffect(() => {
    if (caseData) {
      setCases(caseData.items as ICase[]);
      const getDocs = async () => {
        setDocLoading(true);
        try {
          for (const c of caseData.items) {
            const docs = (await getDocumentsByCaseId(c.id)) as any;
            setDocuments((prev) => [...prev, ...docs?.items]);
          }
        } catch (error) {
          console.error("Error fetching documents:", error);
          // Optionally add error handling UI feedback here
        } finally {
          setDocLoading(false);
        }
      };
      getDocs();
    }
  }, [caseData]);

  const getMDocs = () => documents.filter((doc) => doc.type === DocType.MAIN);
  const [citationLoading, setCitationLoading] = useState(true);
  useEffect(() => {
    if (documents.length > 0 && !docLoading) {
      const fetchCitations = async () => {
        setCitationLoading(true);
        const mainDocs = getMDocs();
        try {
          for (const doc of mainDocs) {
            const res = (await pRetry(() => getCitations(doc.id))) as any;
            const newCitations = (res.items as ICitation[]).filter(
              (newCitation) =>
                !citations.some(
                  (existingCitation) => existingCitation.id === newCitation.id
                )
            );
            if (newCitations.length > 0) {
              setCitations((prev) => [...prev, ...newCitations]);
            }
          }
          setCitationLoading(false);
        } catch (error) {
          console.error("Error fetching citations:", error);
        }
      };
      fetchCitations();
    }
  }, [docLoading]);

  useEffect(() => {
    if (
      !cases ||
      !documents ||
      !citations ||
      caseLoading ||
      citationLoading ||
      docLoading
    )
      return;
    setTableCases(
      cases
        .filter((c) => c.title.toLowerCase().includes(searchKey.toLowerCase()))
        .map((c) => ({
          key: c.id,
          main: documents
            .filter((d) => d.caseId === c.id && d.type === DocType.MAIN)
            .map((m) => ({
              ...m,
              key: m.id,
              exhibits: documents
                .filter((d) => d.caseId === c.id && d.type === DocType.EXHIBIT)
                .map((exh) => ({
                  ...exh,
                  key: exh.id,
                  citedInMainDocuments: getCitedInMainDocuments(exh.id),
                })),
            })),
          ...c,
        }))
    );
  }, [cases, documents, searchKey, citations]);

  const getExhibitsColumns = (): TableColumnType<any>[] => [
    {
      title: "#",
      dataIndex: "",
      key: "index",
      width: "5%",
      render: (_, __, index) => <div className="pb-9">{index + 1}</div>,
    },
    {
      title: "Exhibit Name-Description",
      dataIndex: "title",
      key: "title",
      width: "35%",
      render: (title: string) => (
        <div className="text-xs">
          <div className="underline text-[#056cf3]">{title}</div>
          <div className="text-[#989898] line-clamp-2 text-xs mt-1">
            This Non-Disclosure Agreement (NDA) is a binding contract between
            ABC Corp and XYZ Inc to protect confidential information shared
            during their collaboration. Both parties agree to keep all
            proprietary data, trade s
          </div>
        </div>
      ),
    },
    {
      title: "Cited in - As",
      dataIndex: "citedInMainDocuments",
      key: "citedInMainDocuments",
      render: (citedInMainDocuments: any[]) => (
        <div className="h-full">
          {citedInMainDocuments.map((d, _i) => (
            <div key={_i} className="grid grid-cols-3 text-xs mb-2">
              <div className="underline text-[#056cf3] col-span-2">
                {d.doc.title}
              </div>
              <div className="text-[#989898] line-clamp-2 text-xs mt-1 col-span-1">
                as {d.sourceText}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <div
          className="hover:text-[#056cf3] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(record);
          }}
        >
          <IconEye size={18} />
        </div>
      ),
    },
  ];
  return (
    <BaseLayout>
      <LoadingOverlay
        visible={caseLoading || citationLoading}
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
                expandedRowKeys: expandedCases,
                onExpand: (expanded: boolean, record: any) => {
                  setExpandedCases(
                    expanded
                      ? [...expandedCases, record.key]
                      : expandedCases.filter((key) => key !== record.key)
                  );
                },
                expandedRowRender: (record: any) => (
                  <div className="ml-10 my-1 border rounded-lg bg-white pb-4 shadow-sm">
                    <MyTable
                      columns={getMainDocColumns()}
                      dataSource={record.main}
                      pagination={false}
                      expandable={{
                        expandedRowKeys: expandedMainDocs,
                        onExpand: (expanded: boolean, record: any) => {
                          setExpandedMainDocs(
                            expanded
                              ? [...expandedMainDocs, record.key]
                              : expandedMainDocs.filter(
                                  (key) => key !== record.key
                                )
                          );
                        },
                        expandedRowRender: (record: any) => (
                          <div className="ml-10 my-1 border rounded-lg bg-white pb-4">
                            <MyTable
                              columns={getExhibitsColumns()}
                              dataSource={record.exhibits}
                              pagination={false}
                              onRow={(record: any) => ({
                                onClick: () => handleExhibitClick(record),
                              })}
                            />
                          </div>
                        ),
                      }}
                    />
                  </div>
                ),
              }}
            />
          </div>

          {/* Preview Panel */}
          <div className="col-span-1 bg-white rounded-xl pb-10 relative overflow-hidden border-4">
            {!selExh ? (
              <div className="flex items-center justify-center h-full flex-col gap-2">
                <IconClick size={40} />
                <div className="text-[#292929] mt-4">Exhibit Preview</div>
                <div className="text-[#989898]">
                  Hover over an Exhibit to see a PDF Preview
                </div>
              </div>
            ) : (
              <PdfViewer mediaUrl={selExh?.mediaUrl} />
            )}
          </div>
        </div>
      </div>

      <ExhibitDetailDrawer
        cases={cases}
        opened={drawerOpened}
        close={closeDrawer}
        selExh={selExh}
      />
    </BaseLayout>
  );
}
