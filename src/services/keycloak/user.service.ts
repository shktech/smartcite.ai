import { Group } from "@utils/util.constants";
import axios from "axios";

const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
const realmId = process.env.NEXT_PUBLIC_KEYCLOAK_REALM_ID;
const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET;
const adminUsername = process.env.NEXT_PUBLIC_KEYCLOAK_ADMIN_USERNAME;
const adminPassword = process.env.NEXT_PUBLIC_KEYCLOAK_ADMIN_PASSWORD;
export const getSuperAdminToken = async () => {
  try {
    const response = await axios.post(
      `${keycloakUrl}/realms/${realmId}/protocol/openid-connect/token`,
      {
        username: adminUsername,
        password: adminPassword,
        grant_type: "password",
        client_id: clientId,
        client_secret: clientSecret,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};
export const getHeaderFromToken = (token: string) => {
  const header = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  return header;
};
export const sendResetPasswordEmail = async (userId: string, token: string) => {
  try {
    const sendResetPasswordEmail = await axios.put(
      `${keycloakUrl}/admin/realms/${realmId}/users/${userId}/reset-password-email?client_id=${clientId}`,
      {},
      getHeaderFromToken(token)
    );
    return "Succssfully sent reset password email";
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};
export const getUserByEmail = async (email: string, token: string) => {
  try {
    const getUserByEmail = await axios.get(
      `${keycloakUrl}/admin/realms/${realmId}/users?email=${email}`,
      getHeaderFromToken(token)
    );
    return getUserByEmail.data[0];
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};

export const resetPassword = async (
  userId: string,
  password: string,
  token: string
) => {
  try {
    const payload = {
      type: "password",
      value: password,
      temporary: false,
    } as any;
    const resetPassword = await axios.put(
      `${keycloakUrl}/admin/realms/${realmId}/users/${userId}/reset-password`,
      payload,
      getHeaderFromToken(token)
    );
    return "Successfully reset password";
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};
export const registerUser = async (
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  group: string,
  token: any
) => {
  try {
    const payload = {
      username: email,
      email: email,
      enabled: true,
      firstName: firstName,
      lastName: lastName,
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
      groups: [`/${group}`],
    } as any;

    const registerUser = await axios.post(
      `${keycloakUrl}/admin/realms/${realmId}/users`,
      payload,
      getHeaderFromToken(token)
    );
    const createdUserId = registerUser.headers.location.split("/").pop();

    return createdUserId;
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};

export const sendVerifyEmail = async (userid: string, token: string) => {
  try {
    const sendVerifyEmail = await axios.put(
      `${keycloakUrl}/admin/realms/${realmId}/users/${userid}/send-verify-email`,
      {},
      getHeaderFromToken(token)
    );
    return "Succssfully sent verify email";
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};

export const sendInviteEmail = async (
  email: string,
  organiztionId: string,
  token: string
) => {
  try {
    const payload = {
      email: email,
      firstName: "",
      lastName: "",
    };
    const sendInviteEmail = await axios.post(
      `${keycloakUrl}/admin/realms/${realmId}/organizations/${organiztionId}/members/invite-user`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return "success";
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};

export const completeProfile = async (
  userId: string,
  phone: string,
  practiceArea: string,
  lawFirmName: string,
  licenseNumber: string
) => {
  try {
    const adminToken = await getSuperAdminToken();
    if (!adminToken) throw new Error("Failed to retrieve admin token.");
    const user = await getUserById(userId, adminToken.access_token);
    if (!user) throw new Error("Failed to get user.");
    const payload = {
      ...user,
      id: userId,
      attributes: {
        phone: [phone],
        practiceArea: [practiceArea],
        lawFirmName: [lawFirmName],
        licenseNumber: [licenseNumber],
      },
    };
    const updateUser = await axios.put(
      `${keycloakUrl}/admin/realms/${realmId}/users/${userId}`,
      payload,
      getHeaderFromToken(adminToken.access_token)
    );
    if (!updateUser) throw new Error("Failed to update user.");
    return "Success";
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};

export const verifyEmail = async (userId: string, token: string) => {
  try {
    const user = await getUserById(userId, token);
    const payload = {
      ...user,
      emailVerified: true,
    };
    const updateUser = await axios.put(
      `${keycloakUrl}/admin/realms/${realmId}/users/${userId}`,
      payload,
      getHeaderFromToken(token)
    );
    return updateUser.data;
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};

export const createOrganization = async (
  teamName: string,
  numberOfTeamMemebers: string,
  adminName: string,
  phone: string,
  token: string
) => {
  try {
    const payload = {
      name: teamName,
      alias: teamName,
      enabled: true,
      description: "",
      domains: [
        {
          name: `${teamName}.org`,
          verified: false,
        },
      ],
      attributes: {
        adminName: [adminName],
        numberOfTeamMemebers: [numberOfTeamMemebers],
        phone: [phone],
      },
    };
    const createOrganization = await axios.post(
      `${keycloakUrl}/admin/realms/${realmId}/organizations`,
      payload,
      getHeaderFromToken(token)
    );
    const createOrgId = createOrganization.headers.location.split("/").pop();

    return createOrgId;
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};

export const getUserById = async (userId: string, token: string) => {
  try {
    const getUser = await axios.get(
      `${keycloakUrl}/admin/realms/${realmId}/users/${userId}`,
      getHeaderFromToken(token)
    );
    return getUser.data;
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};

export const addUserToOrganization = async (
  userId: string,
  orgId: string,
  token: string
) => {
  try {
    const response = await fetch(
      `${keycloakUrl}/admin/realms/${realmId}/organizations/${orgId}/members`,
      {
        method: "POST",
        headers: getHeaderFromToken(token).headers,
        body: userId,
      }
    );
    return response;
  } catch (error) {
    console.error("Error found:", error);
    throw error;
  }
};
