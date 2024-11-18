import { Button, LoadingOverlay } from "@mantine/core";
import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState, useRef } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
// Ensure this is set once in your application
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  mediaUrl?: string;
}

const PdfViewer = ({ mediaUrl }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
  };

  useEffect(() => {
    setPageNumber(1);
  }, [mediaUrl]);

  return (
    <div ref={containerRef} className="rounded-lg">
      {/* <div className="absolute top-0 left-0 w-full h-full bg-[#d3d3d342] rounded-xl z-10"></div> */}
      {mediaUrl && (
        <Document
          file={mediaUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <LoadingOverlay
              visible={true}
              zIndex={1000}
              loaderProps={{ color: "black", type: "bars" }}
            />
          }
        >
          <Page pageNumber={pageNumber} width={containerWidth} />
          <div className="absolute bottom-4 left-0 w-full z-10">
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant="default"
                onClick={() => setPageNumber(pageNumber - 1)}
                disabled={pageNumber <= 1}
              >
                Previous
              </Button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="default"
                onClick={() => setPageNumber(pageNumber + 1)}
                disabled={pageNumber >= (numPages || 0)}
              >
                Next
              </Button>
            </div>
          </div>
        </Document>
      )}
    </div>
  );
};

export default PdfViewer;
