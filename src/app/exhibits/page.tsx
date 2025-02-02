"use client";

import React, { useEffect, useState } from "react";
import { Input, LoadingOverlay } from "@mantine/core";
import { notification, TableColumnType, List } from "antd";
import {
  useNavigation,
  useOne,
  useTable,
} from "@refinedev/core";
import { Layout as BaseLayout } from "@/components/layout";
import { IconClick, IconEye, IconSearch } from "@tabler/icons-react";
import { ICase, ICitation, ICitationMap, IDocument } from "@/types/types";
import { DocType } from "@/utils/util.constants";
import MyTable from "@/components/common/MyTable";
import { useDisclosure } from "@mantine/hooks";
import ExhibitDetailDrawer from "@/components/exhibit/ExhibitDetailDrawer";
import { getCitations } from "@services/citation.service";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@components/common/PdfViewer"), {
  ssr: false,
});

export default function DocumentList() {
  const { push } = useNavigation();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");
  const [searchKey, setSearchKey] = useState("");
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [citations, setCitations] = useState<ICitation[]>([]);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [citationMap, setCitationMaps] = useState<ICitationMap[]>([]);
  const [selCitationMap, setSelCitationMap] = useState<ICitationMap>();
  const { data: caseData, isLoading: caseLoading } = useOne<ICase>({
    resource: "cases",
    id: caseId || "",
  });
  const matter = caseData?.data;
  const { data: documentData, isLoading: docLoading } = useTable<any>({
    resource: `cases/${caseId}/documents`,
    syncWithLocation: false,
    queryOptions: {
      onError: () => {
        notification.error({
          message: "Error",
          description: "Failed to fetch data. Please try again later.",
        });
      },
    },
  }).tableQueryResult;

  const mapDocumentsById = (docs: IDocument[]): Record<string, IDocument> => {
    const docMap: Record<string, IDocument> = {};
    for (const d of docs) {
      docMap[d.id] = d;
    }
    return docMap;
  };

  const groupCitationsByDestination = (citations: ICitation[]) => {
    const grouped: Record<string, ICitation[]> = {};

    for (const c of citations) {
      const destId = c.destinationDocumentId;
      if (!grouped[destId]) {
        grouped[destId] = [];
      }
      grouped[destId].push(c);
    }
    return grouped;
  };

  const buildCitationTableRows = (
    docs: IDocument[],
    citations: ICitation[]
  ): ICitationMap[] => {
    const docMap = mapDocumentsById(docs);
    const grouped = groupCitationsByDestination(citations);

    const rows: ICitationMap[] = [];

    for (const destId of Object.keys(grouped)) {
      const citingCitations = grouped[destId];

      const citingDocMap: Record<string, string[]> = {};

      for (const c of citingCitations) {
        if (!citingDocMap[c.sourceDocumentId]) {
          citingDocMap[c.sourceDocumentId] = [];
        }
        citingDocMap[c.sourceDocumentId].push(c.sourceText);
      }

      const citingDocsWithCitedAs: {
        document: IDocument;
        citedAs: string[];
      }[] = Object.entries(citingDocMap)
        .map(([sourceId, citedAs]) => ({
          document: docMap[sourceId],
          citedAs,
        }))
        .filter((entry) => entry.document);

      const destinationDoc = docMap[destId];
      if (!destinationDoc) {
        continue;
      }

      rows.push({
        citedDocument: destinationDoc,
        citingDocuments: citingDocsWithCitedAs,
      });
    }
    console.log(rows);
    return rows;
  };

  React.useEffect(() => {
    if (docLoading || caseLoading || citationLoading) {
      return;
    }
    const citationMaps = buildCitationTableRows(documents, citations);
    setCitationMaps(citationMaps);
    setActiveData(citationMaps?.[0])
  }, [documents, citations]);

  useEffect(() => {
    if (!caseId) {
      push(`/cases`);
    }
  }, [caseId]);

  const getMDocs = () => documents.filter((doc) => doc.type === DocType.MAIN);
  const [citationLoading, setCitationLoading] = useState(false);

  useEffect(() => {
    if (documentData) {
      setDocuments(documentData.items as IDocument[]);
    }
  }, [documentData]);

  useEffect(() => {
    if (documents.length > 0 && !docLoading) {
      const fetchCitations = async () => {
        setCitationLoading(true);
        const mainDocs = getMDocs();
        let citations: ICitation[] = [];
        try {
          for (const doc of mainDocs) {
            const res = (await getCitations(doc.id)) as any;
            const docCitations = res.items as ICitation[];
            citations = [...citations, ...docCitations]
          }
          setCitationLoading(false);
        } catch (error) {
          setCitationLoading(false);
          notification.error({
            message: "Error",
            description: "Failed to fetch citations. Please try again later.",
          });
          console.error("Error fetching citations:", error);
        } finally {
          setCitations(citations);
        }
      };
      fetchCitations();
    }
  }, [documents, docLoading]);

  const columns: TableColumnType<ICitationMap>[] = [
    {
      title: "Cited Document",
      dataIndex: "citedDocument",
      key: "citedDocument",
      align: "center",
      render: (citedDoc) => <div>{citedDoc?.title}</div>,
    },
    {
      title: "Citations",
      dataIndex: "citingDocuments",
      key: "citations",
      render: (citingDocs: { document: IDocument; citedAs: string[] }[]) => (
        <MyTable
          dataSource={citingDocs}
          pagination={false}
          bordered={true}
          rowKey={(record: any) => record.document.id}
          columns={[
            {
              title: "Cited As",
              dataIndex: "citedAs",
              key: "citedAs",
              width: "50%",
              render: (citedAs: string[]) => (
                <List
                  size="small"
                  bordered={false}
                  dataSource={citedAs}
                  renderItem={(text) => <List.Item className="flex items-center">{text}</List.Item>}
                />
              ),
            },
            {
              title: "In Citing Document",
              dataIndex: "document",
              key: "citingDocument",
              width: "50%",
              render: (doc: IDocument) => <div className="flex items-center">{doc.title}</div>,
            },
          ]}
        />
      ),
    },
    {
      title: "Action",
      render: (_value, record: ICitationMap) => (
        <IconEye
          className={"cursor-pointer hover:text-[#2e2e2e]"}
          onClick={() => {
            onActionClick(record, true);
          }}
        />
      ),
    },
  ];

  const setActiveData = (data: ICitationMap) => {
    setSelCitationMap(data);
  };

  const onActionClick = (data: ICitationMap, showDrawer?: boolean) => {
    setActiveData(data);
    showDrawer && openDrawer();
  };

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
            <div className="text-lg text-[#292929]">
              {matter && (
                <>
                  <span className="text-xl font-semibold mr-2">
                    {matter?.title}/
                  </span>
                </>
              )}
              Exhibits
            </div>
            <div className="text-[#7c7c7c] py-2">
              Manage all your exhibits in one place
            </div>
          </div>
        </div>

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

        <div className="grid grid-cols-3 mt-6 gap-4 flex-1">
          <div
            className={`bg-white rounded-xl pb-10 ${
              documents.length > 0 ? "col-span-2" : "col-span-3"
            }`}
          >
            <MyTable
              columns={columns}
              dataSource={citationMap}
              pagination={false}
              onRow={(record: any) => ({
                onClick: () => onActionClick(record, false),
              })}
            />
          </div>

          <div
            className={`bg-transparent rounded-xl relative ${
              documents.length > 0 ? "col-span-1" : "hidden"
            }`}
          >
            {!selCitationMap ? (
              <div className="flex items-center justify-center h-full flex-col gap-2">
                <IconClick size={40} />
                <div className="text-[#292929] mt-4">Document Preview</div>
                <div className="text-[#989898]">
                  Click on an Document to see a PDF Preview
                </div>
              </div>
            ) : (
              <PdfViewer mediaUrl={selCitationMap.citedDocument.mediaUrl} />
            )}
          </div>
        </div>
      </div>

      <ExhibitDetailDrawer
        matter={matter as ICase}
        opened={drawerOpened}
        close={closeDrawer}
        citations={selCitationMap as ICitationMap}      
      />
    </BaseLayout>
  );
}
