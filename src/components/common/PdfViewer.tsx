import { LoadingOverlay } from "@mantine/core";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
// Ensure this is set once in your application
import { Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

interface PdfViewerProps {
  mediaUrl?: string;
}

const PdfViewer = ({ mediaUrl }: PdfViewerProps) => {
  return (
    <div className="rounded-lg">
      {mediaUrl && (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={mediaUrl}
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
  );
};

export default PdfViewer;
