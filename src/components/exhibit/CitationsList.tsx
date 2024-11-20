import { IconEye, IconEyeOff } from "@tabler/icons-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface Citation {
  doc: {
    id: string;
    title: string;
  };
  sourceTexts: string[];
}

interface CitationsListProps {
  citations: Citation[];
}

export default function CitationsList({ citations }: CitationsListProps) {
  const [opened, setOpened] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [shouldShowControls, setShouldShowControls] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setShouldShowControls(contentRef.current.scrollHeight > 70);
    }
  }, [citations]);

  return (
    <div>
      {citations.map((citation, index) => (
        <div key={index} className="text-sm mb-2 flex justify-between">
          <Link
            href={`/documents?documentId=${citation.doc.id}`}
            className="flex"
          >
            <div className="underline text-[#056cf3]">{citation.doc.title}</div>{" "}
            <div className="text-[#989898] ml-2">as</div>
          </Link>
          <div className="relative">
            <div
              ref={contentRef}
              className={`text-[#989898] text-sm italic ${
                opened ? "max-h-[1000px]" : "max-h-[70px]"
              } overflow-y-hidden transition-[max-height] duration-300 ease-in-out`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {citation.sourceTexts.map((text, i) => (
                <div key={i}>{text}</div>
              ))}
              {!opened && shouldShowControls && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
              {hovered && shouldShowControls && (
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center border bg-white hover:text-black h-8 w-8 rounded-full hover:border-black duration-300`}
                  onClick={() => setOpened(!opened)}
                >
                  {opened ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
