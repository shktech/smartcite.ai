import axios from "axios";
import { getAccessToken } from "./auth.service";
import { IDocument } from "../types/types";

const API_URL =
  (process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL_DEV) || "";

export const createDocument = async (
  caseId: string,
  mediaId: string,
  title: string,
  type: string,
  mainDocumentId: string
) => {
  const response = await axios.post(
    `${API_URL}/cases/${caseId}/documents`,
    {
      title: title,
      mediaId: mediaId,
      mainDocumentId: mainDocumentId,
      type: type,
    },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );

  return response.data as IDocument;
};

export const getDocumentsByCaseId = async (caseId: string) => {
  const accessToken = getAccessToken();
  const response = await axios.get(`${API_URL}/cases/${caseId}/documents`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data as IDocument[];
};
