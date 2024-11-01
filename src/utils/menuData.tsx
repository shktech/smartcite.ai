import { IconNotes, IconPaperclip, IconScale } from "@tabler/icons-react";

// src/utils/menuData.ts
export const menuItems = [
  {
    key: "matters",
    icon: <IconScale />,
    label: "Matter Management",
    route: "/cases",
  },
  {
    key: "documents",
    icon: <IconNotes />,
    label: "Document Management",
    route: "/documents",
  },
  {
    key: "exhibits",
    icon: <IconPaperclip />,
    label: "Exhibit Library",
    route: "/exhibits",
  },
  // Add more items as needed
];
