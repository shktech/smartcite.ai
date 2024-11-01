import axios from "axios";
import { getHeaderFromToken } from "./user.service";

const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
const realmId = process.env.NEXT_PUBLIC_KEYCLOAK_REALM_ID;
const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET;
const adminUsername = process.env.NEXT_PUBLIC_KEYCLOAK_ADMIN_USERNAME;
const adminPassword = process.env.NEXT_PUBLIC_KEYCLOAK_ADMIN_PASSWORD;

export const getOrganizationById = async (orgId: string, token: string) => {
  try {
    const getOrg = await axios.get(
      `${keycloakUrl}/admin/realms/${realmId}/organizations/${orgId}`,
      getHeaderFromToken(token)
    );
    return getOrg.data;
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};
