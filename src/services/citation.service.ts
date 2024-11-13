import axios from "axios";
import { getAccessToken } from "./auth.service";
import { ICitation } from "../types/types";

const API_URL =
  (process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL_DEV) || "";

export const getCitations = async (documentId: string) => {
  const response = await axios.get(
    `${API_URL}/documents/${documentId}/citations`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );

  return response.data as ICitation[];
};
