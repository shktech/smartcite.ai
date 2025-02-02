import { Drawer, LoadingOverlay } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "antd/es/typography/Link";
import { ICase, ICitationMap, IDocument } from "@/types/types";
import MyTable from "@components/common/MyTable";
import { useState } from "react";
import { List, TableColumnType } from "antd";
import PdfViewer from "@components/common/PdfViewer";
import React from "react";
interface ExhibitDetailDrawerProps {
  opened: boolean;
  close: () => void;
  matter: ICase;
  citations: ICitationMap;
}

const ExhibitDetailDrawer = ({
  opened,
  close,
  matter,
  citations,
}: ExhibitDetailDrawerProps) => {
  const [selectedCitation, setSelectedCitation] = useState<{ document: IDocument; citedAs: string[] } | null>(null);

  React.useEffect(() => {
    const selectedCitation = citations?.citingDocuments?.[0];
    setSelectedCitation(selectedCitation);
  }, [citations]);

  const columns: TableColumnType<ICitationMap>[] = [
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
          renderItem={(text) => (
            <List.Item className="flex items-center">{text}</List.Item>
          )}
        />
      ),
    },
    {
      title: "In Citing Document",
      dataIndex: "document",
      key: "citingDocument",
      width: "50%",
      render: (doc: IDocument) => (
        <Link
          className="flex items-center"
          onClick={() => {
            setSelectedCitation({ document: doc, citedAs: citations?.citingDocuments?.find((c) => c.document.id === doc.id)?.citedAs || [] });
          }}
        >
          {doc.title}
        </Link>
      ),
    },
  ];

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        withCloseButton={false}
        position="right"
        size="80%"
        styles={{
          body: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <LoadingOverlay
          visible={false}
          zIndex={1000}
          loaderProps={{ color: "black", type: "bars" }}
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <IconArrowRight
              onClick={close}
              size={18}
              className="hover:text-[#525252] cursor-pointer"
            />
            Exhibit Detail
          </div>
        </div>
        <div className="flex flex-col mt-4 text-[#292929]">
          <span>
            Case Title:{" "}
            <Link
              href={`/cases?caseId=${matter?.id}`}
              className="text-[#056cf3] underline"
            >
              {matter?.title}
            </Link>
          </span>
          Cited Document: {citations?.citedDocument?.title}
        </div>
        <div className="mt-4 grid grid-cols-11 text-sm flex-1 gap-4">
          <div className="col-span-5 border rounded-xl relative">
            <div className="flex items-center py-3 pl-4 border-b text-[#292929]">
              Description
            </div>
            <div className="p-4">
              <div className="#292929 mt-3 leading-6">
                Document summary is being generated...
              </div>
              <div className="col-span-5 border rounded-xl relative">
                <div className="flex items-center py-3 pl-4 border-b text-[#292929]">
                  Citation Details
                </div>
                <div className="p-4">
                  <MyTable
                    columns={columns}
                    dataSource={citations?.citingDocuments}
                    pagination={false}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-6 border border-[#eeeff1] relative py-6  bg-[#eeeff1] rounded-xl">
            {selectedCitation && (
              <PdfViewer mediaUrl={selectedCitation?.document.mediaUrl} highlightWords={selectedCitation?.citedAs} />
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ExhibitDetailDrawer;
