import PdfViewer from "@components/common/PdfViewer";
import { Drawer, LoadingOverlay } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
interface ExhibitDetailDrawerProps {
  opened: boolean;
  close: () => void;
  selExh: any;
}

const ExhibitDetailDrawer = ({
  opened,
  close,
  selExh,
}: ExhibitDetailDrawerProps) => {
  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        withCloseButton={false}
        position="right"
        size="900px"
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
        <div className="mt-4 text-[#292929]">
          Case Title:{" "}
          <span className="text-[#056cf3] underline">{selExh?.title}</span>
        </div>
        <div className="mt-4 grid grid-cols-11 text-sm flex-1 gap-4">
          <div className="col-span-5 border rounded-xl relative">
            <div className="flex items-center py-3 pl-4 border-b text-[#292929]">
              Description
            </div>
            <div className="p-4">
              <div className="text-[#056cf3] underline">{selExh?.title}</div>
              <div className="#292929 mt-3 leading-6">
                This Non-Disclosure Agreement (NDA) is a binding contact between
                ABC Corp and XYZ Inc to protect confidential information shared
                during their collaboration. Both parties agree to keep all
                proprietary data, trade secrets, and sensitive information
                disclosed during their partnership strictly confidential and not
                to share it with any third parties.
              </div>
              <div className="text-[#056cf3] mt-4 underline">Complaint</div>
              <div className="text-[#056cf3] mt-4 underline">
                Motion for Summary Judgement
              </div>
              <div className="text-[#056cf3] mt-4 underline">
                Motion for Dismiss
              </div>
              <div className="text-[#056cf3] mt-4 underline">
                Motion for for Extension of Time
              </div>
            </div>
          </div>
          <div className="col-span-6 border rounded-xl p-2 relative">
            {selExh?.mediaUrl && <PdfViewer mediaUrl={selExh.mediaUrl} />}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ExhibitDetailDrawer;
